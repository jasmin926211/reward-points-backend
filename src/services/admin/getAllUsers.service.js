/* eslint-disable indent */
const mongoose = require('mongoose');
const { InternalServerException } = require('utilities/exceptions');
const User = require('models/User');
const {
  DEFAULT_PAGE_SIZE,
  DESCENDING,
  ASCENDING,
  SILVER,
  GOLD,
  PLATINUM,
  DIAMOND,
} = require('utilities/constants');

const generateAggregation = (sort, searchData, page, pageSize) => ({
  $facet: {
    totalData: [
      {
        $match: {
          $and: [searchData, { withdrawalRequest: { $eq: true } }],
        },
      },
      { $sort: sort },
      { $skip: (page - 1) * pageSize }, // skip first 25 data if pageSize=25 and page=1
      { $limit: pageSize }, // return 25 data in each page if  pageSize=25
    ],
    totalCount: [
      // count total users but not count admin and deleted user
      {
        $match: {
          $and: [searchData, { withdrawalRequest: { $eq: true } }],
        },
      },
      { $group: { _id: null, count: { $sum: 1 } } },
    ],
  },
});

const generateAggregationUsers = (
  sort,
  searchData,
  filterByData,
  page,
  pageSize,
) => ({
  $facet: {
    totalData: [
      {
        $match: {
          $and: [searchData, filterByData, {}],
        },
      },
      {
        $lookup: {
          from: 'withdrawtransactions',
          localField: 'withdrawalIds',
          foreignField: '_id',
          as: 'withdrawtransactions',
        },
      },
      { $sort: sort },
      { $skip: (page - 1) * pageSize }, // skip first 25 data if pageSize=25 and page=1
      { $limit: pageSize }, // return 25 data in each page if  pageSize=25
    ],
    totalCount: [
      // count total users but not count admin and deleted user
      {
        $match: {
          $and: [searchData, filterByData, {}],
        },
      },
      { $group: { _id: null, count: { $sum: 1 } } },
    ],
  },
});

const generateProjection = () => ({
  $project: {
    totalData: '$totalData',
    totalCount: '$totalCount.count',
  },
});

const filterByDataQuery = (data) => {
  let filterByData = {};
  if (
    data.filterByPackage === undefined &&
    data.filterByPosition === undefined
  ) {
    filterByData = { ...filterByData };
  } else {
    // filter project by package
    // eslint-disable-next-line no-lonely-if
    if (
      data.filterByPackage &&
      data.filterByPackage.includes(data.filterByPackage)
    ) {
      filterByData = {
        ...filterByData,
        boughtPackages: data.filterByPackage,
      };
    }
    // filter project by position
    if (
      data.filterByPosition &&
      data.filterByPosition.includes(data.filterByPosition)
    ) {
      filterByData = {
        ...filterByData,
        userPosition: data.filterByPosition,
      };
    }
  }
  return filterByData;
};

async function getAllUsers(data) {
  // search query
  const searchData = data.searchText
    ? {
        $or: [
          { uniqueId: { $regex: data.searchText, $options: 'i' } },
          {
            publicAddress: { $regex: data.searchText, $options: 'i' },
          },
        ],
      }
    : {};
  let sort = {};
  if (data.sortBy === 'createdAt' || data.sortBy === undefined) {
    sort = {
      createdAt:
        !data.sortByOrder || data.sortByOrder === DESCENDING ? -1 : 1,
    };
  }
  if (data.sortBy === 'uniqueId') {
    sort = {
      uniqueId:
        !data.sortByOrder || data.sortByOrder === DESCENDING ? -1 : 1,
    };
  }
  if (data.sortBy === 'levelPoints') {
    sort = {
      levelPoints:
        !data.sortByOrder || data.sortByOrder === DESCENDING ? -1 : 1,
    };
  }

  const filterByData = filterByDataQuery(data);
  const page = data.page ? parseInt(data.page) : 0;
  const pageSize = data.pageSize
    ? parseInt(data.pageSize)
    : DEFAULT_PAGE_SIZE;
  try {
    let users;
    if (data.segmentName === 'user-management') {
      users = await User.aggregate([
        generateAggregationUsers(
          sort,
          searchData,
          filterByData,
          page,
          pageSize,
        ),
        generateProjection(),
      ]);
    } else {
      users = await User.aggregate([
        generateAggregation(sort, searchData, page, pageSize),
        generateProjection(),
      ]);
    }
    let successMessage = 'Got all users successfully';
    const totalCount = users[0].totalCount[0];
    const usersData = users[0].totalData;
    let responseData = {
      usersData,
      totalCount,
    };

    if (usersData.length === 0) {
      responseData = [];
      successMessage = 'No users available';
    }

    return Promise.resolve({ successMessage, ...responseData });
  } catch (error) {
    if (error.statusCode) {
      return Promise.reject(error);
    }
    return Promise.reject(
      new InternalServerException('Internal Server Error', error),
    );
  }
}

module.exports = getAllUsers;
