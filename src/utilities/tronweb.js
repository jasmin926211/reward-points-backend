/* eslint-disable indent */
const TronWeb = require('tronweb');
// const TronGrid = require('trongrid');
const config = require('config');
const TronTxDecoder = require('tron-tx-decoder');
const { COMPLETED, FAIL } = require('./constants');

const fullNode = config.get('fullNode');
const solidityNode = config.get('solidityNode');
const eventServer = config.get('eventServer');
const privateKey = config.get('tronWalletPrivateKey');
const tronWeb = new TronWeb(
  fullNode,
  solidityNode,
  eventServer,
  privateKey,
);
const decoder = new TronTxDecoder({ mainnet: true });

async function decodeTxInput(txId) {
  const decodedInput = await decoder.decodeInputById(txId);
  return decodedInput;
}
// const tronGrid = new TronGrid(tronWeb);

const checkTransaction = async (data) => {
  // tronGrid.account
  //   .getTransactions('TWaXfWoeU6mWcQAsUc6ko1tmzcSGnNmmZ2')
  //   .then((s) => {
  //     console.log(s);
  //     s.data.map((ss) =>
  //       console.log(ss.raw_data.contract[0].parameter),
  //     );
  //   });
  console.log('status', data[0]);
  const transaction = tronWeb.trx.getTransactionInfo(data[0]);
  console.log('transaction', transaction);
  const transactionStatus = data.map((tx) =>
    tronWeb.trx
      .getTransaction(tx)
      .then(async (status) => {
        const gCode = await decodeTxInput(tx);
        const amount = tronWeb.fromSun(
          tronWeb.toDecimal(gCode.decodedInput['1']),
        );

        const trxObj = {
          blockchainTransactionID: tx,
          amount,
        };

        switch (status.ret[0].contractRet) {
          case 'SUCCESS':
            trxObj.status = COMPLETED;
            break;
          case 'OUT_OF_ENERGY':
            trxObj.status = FAIL;
            break;
          default:
            trxObj.status = status.ret[0].contractRet;
            break;
        }
        if (amount < 0) {
          trxObj.status = FAIL;
        }
        return trxObj;
      })
      .catch((r) => {
        console.log(r);
      }),
  );
  console.log(transactionStatus);
  return Promise.all(transactionStatus);
};

module.exports = checkTransaction;
