import { MobXProviderContext } from 'mobx-react';
import { useContext } from 'react';
import stores from '../stores/index.js';

export default function useStore(name) {
  const store = useContext(MobXProviderContext);
  return store[name];
}

export const useStores = () => {
  const store = useContext(MobXProviderContext);
  return store;
};
