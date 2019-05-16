// Copyright 2017-2019 @polkadot/api-derive authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import ApiPromise from '@plugnet/api/promise/Api';
import { BlockNumber } from '@plugnet/types';
import { WsProvider } from '@plugnet/rpc-provider';

const WS = 'ws://127.0.0.1:9944/';
// const WS = 'wss://poc3-rpc.polkadot.io/';

describe.skip('derive e2e', () => {
  let api: ApiPromise;

  beforeAll(() => {
    jest.setTimeout(30000);
  });

  beforeEach(async (done) => {
    api = await ApiPromise.create(new WsProvider(WS));
    done();
  });

  it('returns correct results', async () => {
    // https://github.com/plugblockchain/api.js/issues/777
    const block1 = await api.derive.chain.bestNumber();
    await new Promise((resolve) => setTimeout(resolve, 15000));
    const block2 = await api.derive.chain.bestNumber();

    expect((block1 as BlockNumber).eq(block2)).toBe(false);
  });

  it('subscribes to newHead, retrieving the actual validator', (done) => {
    return api.derive.chain.subscribeNewHead(({ author }) => {
      console.log('author', author.toString());

      if (author) {
        done();
      }
    });
  });

  it('retrieves the fees (api.queryMulti)', (done) => {
    return api.derive.balances.fees((fees) => {
      console.error('fees', JSON.stringify(fees));

      done();
    });
  });

  it('retrieves all session info', (done) => {
    let count = 0;

    return api.derive.session.info((info) => {
      console.error(JSON.stringify(info));

      // 5 blocks only, then go our merry way
      if (++count === 5) {
        done();
      }
    });
  });

  it('retrieves the balances', (done) => {
    return api.derive.balances.all('5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', (balance) => {
      console.error(JSON.stringify(balance));

      if (balance.freeBalance.gtn(1)) {
        done();
      }
    });
  });
});
