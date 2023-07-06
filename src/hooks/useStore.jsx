import { MobXProviderContext } from 'mobx-react';
import { useContext } from 'react';

export default function useStore(name) {
  const store = useContext(MobXProviderContext);
  return store[name];
}

export const useStores = () => {
  const store = useContext(MobXProviderContext);
  return store;
};
