// @ts-ignore
// Setup type definitions for built-in Supabase Runtime APIs
// import "@supabase/functions-js"
// @ts-ignore
import { createClient } from '@supabase/supabase-js'

console.log("Upload recording function initialized")

// @ts-ignore
Deno.serve(async (req: Request) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Parse multipart form data
    const formData = await req.formData()

    // Extract fields (treat empty strings as present; only null/undefined is missing)
    const file = formData.get('file') as File | null
    const deviceId = formData.get('deviceId') as string | null
    const rawSpeakerName = formData.get('speakerName') as string | null
    const lineId = formData.get('lineId') as string | null
    const lineIndexStr = formData.get('lineIndex') as string | null
    const lineText = (formData.get('lineText') as string | null) ?? ''
  const durationSecStr = formData.get('durationSec') as string | null
    const status = formData.get('status') as string | null
  const languageRaw = (formData.get('language') as string | null) ?? null

    // Validate required fields (null/undefined only)
    if (!file || deviceId == null || lineId == null || lineIndexStr == null || durationSecStr == null || status == null) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const language = (languageRaw ?? '').trim()
    if (!language) {
      return new Response(JSON.stringify({ error: 'Missing required field: language' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Normalize speakerName (allow empty; fallback to 'default')
    const speakerName = (rawSpeakerName ?? '').trim() || 'default'

    // Validate and parse values
    const lineIndex = parseInt(lineIndexStr, 10)
    const durationSec = parseFloat(durationSecStr)

    if (isNaN(lineIndex) || lineIndex < 0) {
      return new Response(JSON.stringify({ error: 'Invalid lineIndex' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (isNaN(durationSec) || durationSec < 0 || durationSec > 120) {
      return new Response(JSON.stringify({ error: 'Invalid durationSec (must be 0-120)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!['recorded', 'validated'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status (must be "recorded" or "validated")' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large (max 50MB)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase client
    // @ts-ignore
    const supabase = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Compute storage key
  const speakerSlug = speakerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'default'
    // determine extension from file.type if available; default to m4a
    let ext = 'm4a'
    if (file && file.type) {
      if (file.type.includes('webm')) ext = 'webm'
      else if (file.type.includes('mp4') || file.type.includes('m4a')) ext = 'm4a'
      else if (file.type.includes('mpeg')) ext = 'mp3'
    }
    const storageKey = `recordings/speaker/${speakerSlug}/device/${deviceId}/line/${lineId}.${ext}`

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('recordings')
      .upload(storageKey, file, {
        contentType: file?.type || 'application/octet-stream',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(JSON.stringify({ error: `Failed to upload file: ${uploadError.message || uploadError}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('recordings')
      .getPublicUrl(storageKey)

    // Upsert speaker
    const { data: speakerData, error: speakerError } = await supabase
      .from('speakers')
      .upsert({
        device_id: deviceId,
        display_name: speakerName
      }, {
        onConflict: 'device_id,display_name'
      })
      .select('id')
      .single()

    if (speakerError) {
      console.error('Speaker upsert error:', speakerError)
      return new Response(JSON.stringify({ error: `Failed to upsert speaker: ${speakerError.message || speakerError}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const speakerId = speakerData.id

    // Upsert utterance
    const { data: utteranceData, error: utteranceError } = await supabase
      .from('utterances')
      .upsert({
        id: lineId,
        device_id: deviceId,
        speaker_id: speakerId,
        idx: lineIndex,
        text: lineText,
        language: language
      }, {
        onConflict: 'id'
      })
      .select('id')
      .single()

    if (utteranceError) {
      console.error('Utterance upsert error:', utteranceError)
      return new Response(JSON.stringify({ error: `Failed to upsert utterance: ${utteranceError.message || utteranceError}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const utteranceId = utteranceData.id

    // Insert recording (enforce unique validated per speaker-utterance)
    const { data: recordingData, error: recordingError } = await supabase
      .from('recordings')
      .insert({
        device_id: deviceId,
        speaker_id: speakerId,
        utterance_id: utteranceId,
        duration_sec: durationSec,
        status: status,
        storage_key: storageKey,
        ext: ext
      })
      .select('id')
      .single()

    if (recordingError) {
      // Check if it's a unique constraint violation for validated recordings
      if (recordingError.code === '23505' && status === 'validated') {
        console.error('Duplicate validated recording:', recordingError)
        return new Response(JSON.stringify({ error: 'A validated recording already exists for this speaker and utterance' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      console.error('Recording insert error:', recordingError)
      return new Response(JSON.stringify({ error: `Failed to insert recording: ${recordingError.message || recordingError}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const recordingId = recordingData.id

    // Return success response
    return new Response(
      JSON.stringify({
        publicUrl,
        storageKey,
        speakerId,
        utteranceId,
        recordingId
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
