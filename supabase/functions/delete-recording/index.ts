// @ts-ignore
import { createClient } from '@supabase/supabase-js'

console.log('Delete recording function initialized')

// @ts-ignore
Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const payload = await req.json().catch(() => null) as {
      recordingId?: string
      utteranceId?: string
      speakerId?: string
    } | null

    if (!payload || !payload.recordingId || !payload.utteranceId || !payload.speakerId) {
      return new Response(JSON.stringify({ error: 'Missing required IDs' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { recordingId, utteranceId, speakerId } = payload

    // @ts-ignore
    const supabase = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1) Fetch recording to get storage_key and bucket info
    const { data: rec, error: recErr } = await supabase
      .from('recordings')
      .select('id, storage_key')
      .eq('id', recordingId)
      .single()

    if (recErr) {
      console.error('Fetch recording error:', recErr)
      return new Response(JSON.stringify({ error: 'Recording not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const storageKey = rec?.storage_key as string | undefined

    // 2) Delete recording row
    const { error: delRecErr } = await supabase
      .from('recordings')
      .delete()
      .eq('id', recordingId)

    if (delRecErr) {
      console.error('Delete recording error:', delRecErr)
      return new Response(JSON.stringify({ error: `Failed to delete recording: ${delRecErr.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3) Delete storage object (best-effort)
    if (storageKey) {
      const { error: storageErr } = await supabase.storage.from('recordings').remove([storageKey])
      if (storageErr) {
        console.warn('Failed to delete storage object:', storageErr)
      }
    }

    // 4) If no other recordings for this utterance, delete the utterance
    const { data: recCount, error: recCountErr } = await supabase
      .from('recordings')
      .select('id', { count: 'exact', head: true })
      .eq('utterance_id', utteranceId)

    if (!recCountErr && (recCount === null || (recCount as any).length === 0)) {
      const { error: delUttErr } = await supabase
        .from('utterances')
        .delete()
        .eq('id', utteranceId)
      if (delUttErr) {
        console.warn('Failed to delete utterance:', delUttErr)
      }
    }

    // 5) If speaker has no recordings and no utterances, delete the speaker
    const [{ data: spkRecCount }, { data: spkUttCount }] = await Promise.all([
      supabase.from('recordings').select('id', { count: 'exact', head: true }).eq('speaker_id', speakerId),
      supabase.from('utterances').select('id', { count: 'exact', head: true }).eq('speaker_id', speakerId),
    ])

    const noRecs = !spkRecCount || (spkRecCount as any).length === 0
    const noUtts = !spkUttCount || (spkUttCount as any).length === 0

    if (noRecs && noUtts) {
      const { error: delSpeakerErr } = await supabase
        .from('speakers')
        .delete()
        .eq('id', speakerId)
      if (delSpeakerErr) {
        console.warn('Failed to delete speaker:', delSpeakerErr)
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
