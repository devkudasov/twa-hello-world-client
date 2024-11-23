import { useEffect, useState } from 'react';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import Counter from '../contracts/counter';
import { Address, OpenedContract } from '@ton/core';
import { useTonConnect } from './useTonConnect';

export function useCounterContract() {
  const clinet = useTonClient();
  const [val, setVal] = useState<null | number>(null);
  const { sender } = useTonConnect();

  const sleep = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time));

  const counterContract = useAsyncInitialize(async () => {
    if (!clinet) return;

    return clinet.open(
      new Counter(
        Address.parse('EQAW96FQ8VGpLKflTdmeNv9rzzxyxJrGvmdY7NbnrktlLY7Z')
      )
    ) as OpenedContract<Counter>;
  });

  useEffect(() => {
    async function getValue() {
      if (!counterContract) return;
      setVal(null);

      const val = await counterContract?.getCounter();
      setVal(Number(val));

      await sleep(5000); // sleep 5 seconds and poll value again
      getValue();
    }
    getValue();
  }, [counterContract]);

  return {
    value: val,
    address: counterContract?.address.toString(),
    sendIncrement: () => {
      return counterContract?.sendIncrement(sender);
    },
  };
}
