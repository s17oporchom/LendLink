import { useEffect, useMemo, useState } from 'react';
import { AbiItem } from 'web3-utils';

import { contractReader } from 'utils/sovryn/contract-reader';
import { CacheCallResponse } from '../useCacheCall';
import { idHash, observeCall, startCall } from 'utils/blockchain/cache';
import { useIsMounted } from '../useIsMounted';
import { useBlockSync } from '../useAccount';

/**
 * Calls blockchain on read node to get data.
 * Updates data by calling blockchain again if any of method args changed.
 * @param contractName
 * @param methodName
 * @param args
 */
export function useCacheCallTo<T = string>(
  to: string,
  abi: AbiItem | AbiItem[],
  methodName: string,
  args: any[],
): CacheCallResponse<T> {
  const isMounted = useIsMounted();
  const syncBlock = useBlockSync();

  const [state, setState] = useState<CacheCallResponse<T>>({
    value: null,
    loading: false,
    error: null,
  });

  const hashedArgs = useMemo(
    () => idHash([to, methodName, args]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [to, abi, methodName, args, JSON.stringify(args)],
  );

  useEffect(() => {
    if (!isMounted()) {
      return;
    }

    const sub = observeCall(hashedArgs).subscribe(e =>
      setState(e.result as CacheCallResponse<T>),
    );

    startCall(hashedArgs, () =>
      contractReader.callByAddressDirect(to, abi, methodName, args),
    );

    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, methodName, syncBlock, JSON.stringify(args), JSON.stringify(abi)]);

  return state;
}
