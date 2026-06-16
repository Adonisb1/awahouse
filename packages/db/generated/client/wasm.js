
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  phone: 'phone',
  email: 'email',
  roles: 'roles',
  activeRole: 'activeRole',
  firstName: 'firstName',
  lastName: 'lastName',
  ninHash: 'ninHash',
  avatarUrl: 'avatarUrl',
  rentScore: 'rentScore',
  isDeleted: 'isDeleted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LandlordProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  firmName: 'firmName',
  bankName: 'bankName',
  bankCode: 'bankCode',
  bankAccount: 'bankAccount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PropertyScalarFieldEnum = {
  id: 'id',
  ownerId: 'ownerId',
  title: 'title',
  description: 'description',
  address: 'address',
  lga: 'lga',
  type: 'type',
  bedrooms: 'bedrooms',
  bathrooms: 'bathrooms',
  priceKobo: 'priceKobo',
  isAvailable: 'isAvailable',
  isDeleted: 'isDeleted',
  verificationBadge: 'verificationBadge',
  latitude: 'latitude',
  longitude: 'longitude',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PropertyImageScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  url: 'url',
  thumbnail: 'thumbnail',
  alt: 'alt',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt'
};

exports.Prisma.SavedPropertyScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  propertyId: 'propertyId',
  createdAt: 'createdAt'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  reviewerId: 'reviewerId',
  revieweeId: 'revieweeId',
  propertyId: 'propertyId',
  escrowId: 'escrowId',
  type: 'type',
  rating: 'rating',
  comment: 'comment',
  isVerified: 'isVerified',
  isPublished: 'isPublished',
  createdAt: 'createdAt'
};

exports.Prisma.VerificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  status: 'status',
  metadata: 'metadata',
  documentUrl: 'documentUrl',
  reviewerId: 'reviewerId',
  reviewedAt: 'reviewedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EscrowTransactionScalarFieldEnum = {
  id: 'id',
  propertyId: 'propertyId',
  tenantId: 'tenantId',
  landlordId: 'landlordId',
  agentId: 'agentId',
  status: 'status',
  amountKobo: 'amountKobo',
  platformFeeKobo: 'platformFeeKobo',
  landlordPayoutKobo: 'landlordPayoutKobo',
  paymentProvider: 'paymentProvider',
  paymentReference: 'paymentReference',
  paymentAccessCode: 'paymentAccessCode',
  disputeReason: 'disputeReason',
  disputedAt: 'disputedAt',
  completedAt: 'completedAt',
  rentMonthly: 'rentMonthly',
  payoutReference: 'payoutReference',
  payoutTransferCode: 'payoutTransferCode',
  isDeleted: 'isDeleted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransactionLogScalarFieldEnum = {
  id: 'id',
  escrowId: 'escrowId',
  fromStatus: 'fromStatus',
  toStatus: 'toStatus',
  actorId: 'actorId',
  reason: 'reason',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  body: 'body',
  link: 'link',
  isRead: 'isRead',
  channel: 'channel',
  createdAt: 'createdAt'
};

exports.Prisma.RentInstalmentScalarFieldEnum = {
  id: 'id',
  escrowId: 'escrowId',
  userId: 'userId',
  instalmentNumber: 'instalmentNumber',
  amountKobo: 'amountKobo',
  dueDate: 'dueDate',
  paidAt: 'paidAt',
  status: 'status',
  retryCount: 'retryCount',
  paymentReference: 'paymentReference',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RentScoreEventScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventType: 'eventType',
  delta: 'delta',
  scoreAfter: 'scoreAfter',
  escrowId: 'escrowId',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  tenant: 'tenant',
  landlord: 'landlord',
  agent: 'agent',
  admin: 'admin'
};

exports.PropertyType = exports.$Enums.PropertyType = {
  apartment: 'apartment',
  duplex: 'duplex',
  bungalow: 'bungalow',
  studio: 'studio',
  commercial: 'commercial'
};

exports.VerificationBadge = exports.$Enums.VerificationBadge = {
  pending: 'pending',
  agent_verified: 'agent_verified',
  title_confirmed: 'title_confirmed',
  fully_verified: 'fully_verified'
};

exports.ReviewType = exports.$Enums.ReviewType = {
  property: 'property',
  landlord: 'landlord',
  agent: 'agent'
};

exports.VerificationType = exports.$Enums.VerificationType = {
  nin: 'nin',
  lasrera: 'lasrera',
  esvarbon: 'esvarbon',
  niesv: 'niesv',
  aean: 'aean',
  ercaan: 'ercaan',
  redan: 'redan',
  property_title: 'property_title'
};

exports.VerificationStatus = exports.$Enums.VerificationStatus = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected'
};

exports.EscrowStatus = exports.$Enums.EscrowStatus = {
  pending_payment: 'pending_payment',
  funds_held: 'funds_held',
  docs_verified: 'docs_verified',
  key_handover_pending: 'key_handover_pending',
  completed: 'completed',
  refunded: 'refunded',
  cancelled: 'cancelled',
  disputed: 'disputed'
};

exports.PaymentProvider = exports.$Enums.PaymentProvider = {
  monnify: 'monnify',
  paystack: 'paystack'
};

exports.RentInstalmentStatus = exports.$Enums.RentInstalmentStatus = {
  scheduled: 'scheduled',
  paid: 'paid',
  overdue: 'overdue',
  missed: 'missed'
};

exports.RentScoreEventType = exports.$Enums.RentScoreEventType = {
  on_time_payment: 'on_time_payment',
  late_payment: 'late_payment',
  missed_payment: 'missed_payment',
  escrow_completed: 'escrow_completed',
  dispute_raised: 'dispute_raised'
};

exports.Prisma.ModelName = {
  User: 'User',
  LandlordProfile: 'LandlordProfile',
  Property: 'Property',
  PropertyImage: 'PropertyImage',
  SavedProperty: 'SavedProperty',
  Review: 'Review',
  Verification: 'Verification',
  EscrowTransaction: 'EscrowTransaction',
  TransactionLog: 'TransactionLog',
  Notification: 'Notification',
  RentInstalment: 'RentInstalment',
  RentScoreEvent: 'RentScoreEvent'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
