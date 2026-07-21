import AuthForm from "@/app/auth/AuthForm"

type Props = { searchParams: { next?: string; error?: string } }

export default function LoginPage({ searchParams }: Props) {
  return <AuthForm mode="login" nextPath={searchParams.next} oauthError={searchParams.error === "oauth"} />
}