module.exports = {
  port: process.env.PORT,
  apiVersion: 'v1',
  dbConfig: {
    connectionString: `${process.env.mongoURI}/${process.env.mongoDBName}`,
  },
  logLevel: 'debug',
  fullNode: 'https://api.trongrid.io',
  solidityNode: 'https://api.trongrid.io',
  eventServer: 'https://api.trongrid.io',
  adminLoginSecret: process.env.ADMIN_LOGIN_SECRET,
  tronWalletPrivateKey: process.env.TRON_WALLET_PRIVATE_KEY,
  weeklyCapDays: 7,
  holdingPeriod: 7,
  promoTimePeriod: '* * * * * 1', // every monday
  profitPointsRewardPercentage: 0.16,
  cryptoTokenMultiplier: 5,
  cryptoTokenPercentage: 0.25,
  internalTokensPercentage: 0.75,
  paymentPackages: [
    {
      name: 'silver',
      price: 75,
      points: 270,
      days: 1,
      tokenPrice: 300,
      referralUserCount: NaN,
      communityBonusPercentage: NaN,
      weeklyCap: 6000,
      superBinaryCap: NaN,
      superBinaryRewardPercentage: NaN,
    },
    {
      name: 'gold',
      price: 250,
      points: 900,
      days: 2,
      tokenPrice: 1000,
      referralUserCount: 5,
      communityBonusPercentage: 0.08,
      weeklyCap: 20000,
      superBinaryCap: 1000,
      superBinaryRewardPercentage: 0.07,
    },
    {
      name: 'platinum',
      price: 1250,
      points: 4500,
      days: 3,
      tokenPrice: 5000,
      referralUserCount: 10,
      communityBonusPercentage: 0.08,
      weeklyCap: 40000,
      superBinaryCap: 5000,
      superBinaryRewardPercentage: 0.07,
    },
    {
      name: 'diamond',
      price: 2500,
      points: 9000,
      days: 4,
      tokenPrice: 10000,
      referralUserCount: 15,
      communityBonusPercentage: 0.08,
      weeklyCap: 100000,
      superBinaryCap: 10000,
      superBinaryRewardPercentage: 0.07,
    },
  ],
  promoPlans: [
    {
      promoId: 1,
      points: 5,
    },
    {
      promoId: 2,
      points: 5,
    },
    {
      promoId: 3,
      points: 5,
    },
    {
      promoId: 4,
      points: 5,
    },
  ],
  levelPointsAndPosition: [
    {
      position: 'Advisor',
      points: 6000,
    },
    {
      position: 'SR Advisor',
      points: 15000,
    },
    {
      position: 'Leader',
      points: 60000,
    },
    {
      position: 'SR Coordinator',
      points: 150000,
    },
    {
      position: 'Pool Emperor',
      points: 600000,
    },
    {
      position: 'Manager',
      points: 1500000,
    },
    {
      position: 'Director',
      points: 6000000,
    },
    {
      position: 'Chief Director',
      points: 15000000,
    },
    {
      position: 'President',
      points: 60000000,
    },
    {
      position: 'Ambassador',
      points: 150000000,
    },
    {
      position: 'Brand Ambassador',
      points: 600000000,
    },
  ],
};
