import { AuthFlow } from '../../components/AuthFlow';

interface Props {
  onSwitchToLogin?: () => void;
}

export function SignupPage(_props: Props) {
  return <AuthFlow />;
}
