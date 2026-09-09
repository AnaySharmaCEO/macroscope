import { AuthFlow } from '../../components/AuthFlow';

interface Props {
  onSwitchToSignup?: () => void;
}

export function LoginPage(_props: Props) {
  return <AuthFlow />;
}
