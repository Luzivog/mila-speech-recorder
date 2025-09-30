import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the record screen as the default route
  return <Redirect href="/record" />;
}