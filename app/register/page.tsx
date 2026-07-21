import AuthForm from "@/app/auth/AuthForm"

type Props = { searchParams: { next?: string; error?: string } }

export default function RegisterPage({ searchParams }: Props) {
  return <AuthForm mode="register" nextPath={searchParams.next} oauthError={searchParams.error === "oauth"} />
}