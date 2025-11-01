import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const App: React.FC<Props> = (props: Props) => {
  const { children } = props;
  return <>{children}</>;
};

export default App;
