
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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




  const path = require('path')

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
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/home/martins/awahouse/packages/db/generated/client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "debian-openssl-1.1.x",
        "native": true
      },
      {
        "fromEnvVar": null,
        "value": "rhel-openssl-3.0.x"
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "/home/martins/awahouse/packages/db/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../.env"
  },
  "relativePath": "../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider      = \"prisma-client-js\"\n  binaryTargets = [\"native\", \"rhel-openssl-3.0.x\"]\n  output        = \"../generated/client\"\n}\n\ndatasource db {\n  provider     = \"postgresql\"\n  url          = env(\"DATABASE_URL\")\n  directUrl    = env(\"DIRECT_URL\")\n  relationMode = \"prisma\"\n}\n\nenum UserRole {\n  tenant\n  landlord\n  agent\n  admin\n}\n\nenum VerificationType {\n  nin\n  lasrera\n  esvarbon\n  niesv\n  aean\n  ercaan\n  redan\n  property_title\n}\n\nenum VerificationStatus {\n  pending\n  approved\n  rejected\n}\n\nenum PropertyType {\n  apartment\n  duplex\n  bungalow\n  studio\n  commercial\n}\n\nenum VerificationBadge {\n  pending\n  agent_verified\n  title_confirmed\n  fully_verified\n}\n\nenum ReviewType {\n  property\n  landlord\n  agent\n}\n\nenum PaymentProvider {\n  monnify\n  paystack\n}\n\nenum EscrowStatus {\n  pending_payment\n  funds_held\n  docs_verified\n  key_handover_pending\n  completed\n  refunded\n  cancelled\n  disputed\n}\n\nenum RentInstalmentStatus {\n  scheduled\n  paid\n  overdue\n  missed\n}\n\nenum RentScoreEventType {\n  on_time_payment\n  late_payment\n  missed_payment\n  escrow_completed\n  dispute_raised\n}\n\nmodel User {\n  id         String     @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  phone      String?\n  email      String     @unique\n  roles      UserRole[]\n  activeRole UserRole   @default(tenant) @map(\"active_role\")\n  firstName  String?    @map(\"first_name\")\n  lastName   String?    @map(\"last_name\")\n  ninHash    String?    @unique @map(\"nin_hash\")\n  avatarUrl  String?    @map(\"avatar_url\")\n  rentScore  Int        @default(500) @map(\"rent_score\")\n  isDeleted  Boolean    @default(false) @map(\"is_deleted\")\n  createdAt  DateTime   @default(now()) @map(\"created_at\")\n  updatedAt  DateTime   @updatedAt @map(\"updated_at\")\n\n  verifications      Verification[]\n  properties         Property[]\n  savedProperties    SavedProperty[]\n  reviewsWritten     Review[]            @relation(\"ReviewsWritten\")\n  reviewsReceived    Review[]            @relation(\"ReviewsReceived\")\n  escrowTransactions EscrowTransaction[] @relation(\"TenantEscrows\")\n  escrowAsLandlord   EscrowTransaction[] @relation(\"LandlordEscrows\")\n  escrowAsAgent      EscrowTransaction[] @relation(\"AgentEscrows\")\n  notifications      Notification[]\n  transactionLogs    TransactionLog[]\n  rentInstalments    RentInstalment[]\n  rentScoreEvents    RentScoreEvent[]\n\n  landlordProfile LandlordProfile?\n\n  @@map(\"users\")\n}\n\nmodel LandlordProfile {\n  id          String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId      String   @unique @map(\"user_id\") @db.Uuid\n  firmName    String?  @map(\"firm_name\")\n  bankName    String?  @map(\"bank_name\")\n  bankCode    String?  @map(\"bank_code\")\n  bankAccount String?  @map(\"bank_account\")\n  createdAt   DateTime @default(now()) @map(\"created_at\")\n  updatedAt   DateTime @updatedAt @map(\"updated_at\")\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@map(\"landlord_profiles\")\n}\n\nmodel Property {\n  id                String            @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  ownerId           String            @map(\"owner_id\") @db.Uuid\n  title             String\n  description       String?\n  address           String?\n  lga               String?\n  type              PropertyType\n  bedrooms          Int               @default(1)\n  bathrooms         Int               @default(1)\n  priceKobo         BigInt            @map(\"price_kobo\")\n  isAvailable       Boolean           @default(true) @map(\"is_available\")\n  isDeleted         Boolean           @default(false) @map(\"is_deleted\")\n  verificationBadge VerificationBadge @default(pending) @map(\"verification_badge\")\n  latitude          Float?\n  longitude         Float?\n  metadata          Json?\n  createdAt         DateTime          @default(now()) @map(\"created_at\")\n  updatedAt         DateTime          @updatedAt @map(\"updated_at\")\n\n  owner   User                @relation(fields: [ownerId], references: [id])\n  images  PropertyImage[]\n  savedBy SavedProperty[]\n  reviews Review[]\n  escrows EscrowTransaction[]\n\n  @@index([lga])\n  @@index([type])\n  @@index([ownerId])\n  @@index([priceKobo])\n  @@index([createdAt])\n  @@index([isAvailable, isDeleted, verificationBadge])\n  @@map(\"properties\")\n}\n\nmodel PropertyImage {\n  id         String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  propertyId String   @map(\"property_id\") @db.Uuid\n  url        String\n  thumbnail  String?\n  alt        String?\n  sortOrder  Int      @default(0) @map(\"sort_order\")\n  createdAt  DateTime @default(now()) @map(\"created_at\")\n\n  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)\n\n  @@index([propertyId])\n  @@map(\"property_images\")\n}\n\nmodel SavedProperty {\n  id         String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId     String   @map(\"user_id\") @db.Uuid\n  propertyId String   @map(\"property_id\") @db.Uuid\n  createdAt  DateTime @default(now()) @map(\"created_at\")\n\n  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  property Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, propertyId])\n  @@map(\"saved_properties\")\n}\n\nmodel Review {\n  id          String     @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  reviewerId  String     @map(\"reviewer_id\") @db.Uuid\n  revieweeId  String     @map(\"reviewee_id\") @db.Uuid\n  propertyId  String?    @map(\"property_id\") @db.Uuid\n  escrowId    String?    @map(\"escrow_id\") @db.Uuid\n  type        ReviewType\n  rating      Int\n  comment     String?\n  isVerified  Boolean    @default(false) @map(\"is_verified\")\n  isPublished Boolean    @default(true) @map(\"is_published\")\n  createdAt   DateTime   @default(now()) @map(\"created_at\")\n\n  reviewer User               @relation(\"ReviewsWritten\", fields: [reviewerId], references: [id])\n  reviewee User               @relation(\"ReviewsReceived\", fields: [revieweeId], references: [id])\n  property Property?          @relation(fields: [propertyId], references: [id])\n  escrow   EscrowTransaction? @relation(fields: [escrowId], references: [id])\n\n  @@unique([reviewerId, escrowId])\n  @@index([propertyId])\n  @@index([revieweeId])\n  @@index([reviewerId])\n  @@index([createdAt])\n  @@map(\"reviews\")\n}\n\nmodel Verification {\n  id          String             @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId      String             @map(\"user_id\") @db.Uuid\n  type        VerificationType\n  status      VerificationStatus @default(pending)\n  metadata    Json?\n  documentUrl String?            @map(\"document_url\")\n  reviewerId  String?            @map(\"reviewer_id\") @db.Uuid\n  reviewedAt  DateTime?          @map(\"reviewed_at\")\n  createdAt   DateTime           @default(now()) @map(\"created_at\")\n  updatedAt   DateTime           @updatedAt @map(\"updated_at\")\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, type])\n  @@index([status])\n  @@map(\"verifications\")\n}\n\nmodel EscrowTransaction {\n  id                 String          @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  propertyId         String          @map(\"property_id\") @db.Uuid\n  tenantId           String          @map(\"tenant_id\") @db.Uuid\n  landlordId         String          @map(\"landlord_id\") @db.Uuid\n  agentId            String?         @map(\"agent_id\") @db.Uuid\n  status             EscrowStatus    @default(pending_payment)\n  amountKobo         BigInt          @map(\"amount_kobo\")\n  platformFeeKobo    BigInt          @map(\"platform_fee_kobo\")\n  landlordPayoutKobo BigInt          @map(\"landlord_payout_kobo\")\n  paymentProvider    PaymentProvider @default(monnify) @map(\"payment_provider\")\n  paymentReference   String?         @map(\"payment_reference\")\n  paymentAccessCode  String?         @map(\"payment_access_code\")\n  disputeReason      String?         @map(\"dispute_reason\")\n  disputedAt         DateTime?       @map(\"disputed_at\")\n  completedAt        DateTime?       @map(\"completed_at\")\n  rentMonthly        Boolean         @default(false) @map(\"rent_monthly\")\n  payoutReference    String?         @map(\"payout_reference\")\n  payoutTransferCode String?         @map(\"payout_transfer_code\")\n  isDeleted          Boolean         @default(false) @map(\"is_deleted\")\n  createdAt          DateTime        @default(now()) @map(\"created_at\")\n  updatedAt          DateTime        @updatedAt @map(\"updated_at\")\n\n  tenant      User             @relation(\"TenantEscrows\", fields: [tenantId], references: [id])\n  landlord    User             @relation(\"LandlordEscrows\", fields: [landlordId], references: [id])\n  agent       User?            @relation(\"AgentEscrows\", fields: [agentId], references: [id])\n  property    Property         @relation(fields: [propertyId], references: [id])\n  logs        TransactionLog[]\n  reviews     Review[]\n  instalments RentInstalment[]\n  scoreEvents RentScoreEvent[]\n\n  @@index([tenantId])\n  @@index([landlordId])\n  @@index([agentId])\n  @@index([status])\n  @@index([isDeleted])\n  @@index([createdAt])\n  @@index([paymentReference])\n  @@map(\"escrow_transactions\")\n}\n\nmodel TransactionLog {\n  id         String       @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  escrowId   String       @map(\"escrow_id\") @db.Uuid\n  fromStatus EscrowStatus @map(\"from_status\")\n  toStatus   EscrowStatus @map(\"to_status\")\n  actorId    String       @map(\"actor_id\") @db.Uuid\n  reason     String?\n  createdAt  DateTime     @default(now()) @map(\"created_at\")\n\n  escrow EscrowTransaction @relation(fields: [escrowId], references: [id])\n  actor  User              @relation(fields: [actorId], references: [id])\n\n  @@index([escrowId])\n  @@map(\"transaction_logs\")\n}\n\nmodel Notification {\n  id        String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId    String   @map(\"user_id\") @db.Uuid\n  title     String\n  body      String\n  link      String?\n  isRead    Boolean  @default(false) @map(\"is_read\")\n  channel   String   @default(\"in_app\")\n  createdAt DateTime @default(now()) @map(\"created_at\")\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId, isRead])\n  @@map(\"notifications\")\n}\n\nmodel RentInstalment {\n  id               String               @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  escrowId         String               @map(\"escrow_id\") @db.Uuid\n  userId           String               @map(\"user_id\") @db.Uuid\n  instalmentNumber Int                  @map(\"instalment_number\")\n  amountKobo       BigInt               @map(\"amount_kobo\")\n  dueDate          DateTime             @map(\"due_date\")\n  paidAt           DateTime?            @map(\"paid_at\")\n  status           RentInstalmentStatus @default(scheduled)\n  retryCount       Int                  @default(0) @map(\"retry_count\")\n  paymentReference String?              @map(\"payment_reference\")\n  createdAt        DateTime             @default(now()) @map(\"created_at\")\n  updatedAt        DateTime             @updatedAt @map(\"updated_at\")\n\n  user   User              @relation(fields: [userId], references: [id])\n  escrow EscrowTransaction @relation(fields: [escrowId], references: [id])\n\n  @@unique([escrowId, instalmentNumber])\n  @@index([userId, status])\n  @@index([dueDate])\n  @@map(\"rent_instalments\")\n}\n\nmodel RentScoreEvent {\n  id         String             @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId     String             @map(\"user_id\") @db.Uuid\n  eventType  RentScoreEventType @map(\"event_type\")\n  delta      Int\n  scoreAfter Int                @map(\"score_after\")\n  escrowId   String?            @map(\"escrow_id\") @db.Uuid\n  metadata   Json?\n  createdAt  DateTime           @default(now()) @map(\"created_at\")\n\n  user   User               @relation(fields: [userId], references: [id])\n  escrow EscrowTransaction? @relation(fields: [escrowId], references: [id])\n\n  @@index([userId])\n  @@index([userId, createdAt])\n  @@map(\"rent_score_events\")\n}\n",
  "inlineSchemaHash": "cf41bd29ed63b82270208ab3008f5c5a2acbd1610da3d600a4751436a89b112e",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "generated/client",
    "client",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"dbName\":\"users\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"roles\",\"kind\":\"enum\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserRole\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"activeRole\",\"dbName\":\"active_role\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"UserRole\",\"default\":\"tenant\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firstName\",\"dbName\":\"first_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastName\",\"dbName\":\"last_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ninHash\",\"dbName\":\"nin_hash\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avatarUrl\",\"dbName\":\"avatar_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rentScore\",\"dbName\":\"rent_score\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":500,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isDeleted\",\"dbName\":\"is_deleted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"verifications\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Verification\",\"relationName\":\"UserToVerification\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"properties\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Property\",\"relationName\":\"PropertyToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"savedProperties\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SavedProperty\",\"relationName\":\"SavedPropertyToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reviewsWritten\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Review\",\"relationName\":\"ReviewsWritten\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reviewsReceived\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Review\",\"relationName\":\"ReviewsReceived\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escrowTransactions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EscrowTransaction\",\"relationName\":\"TenantEscrows\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escrowAsLandlord\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EscrowTransaction\",\"relationName\":\"LandlordEscrows\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escrowAsAgent\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EscrowTransaction\",\"relationName\":\"AgentEscrows\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notifications\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Notification\",\"relationName\":\"NotificationToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"transactionLogs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TransactionLog\",\"relationName\":\"TransactionLogToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rentInstalments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RentInstalment\",\"relationName\":\"RentInstalmentToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rentScoreEvents\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RentScoreEvent\",\"relationName\":\"RentScoreEventToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"landlordProfile\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"LandlordProfile\",\"relationName\":\"LandlordProfileToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"LandlordProfile\":{\"dbName\":\"landlord_profiles\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"firmName\",\"dbName\":\"firm_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bankName\",\"dbName\":\"bank_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bankCode\",\"dbName\":\"bank_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bankAccount\",\"dbName\":\"bank_account\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"LandlordProfileToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Property\":{\"dbName\":\"properties\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ownerId\",\"dbName\":\"owner_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lga\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PropertyType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bedrooms\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bathrooms\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"priceKobo\",\"dbName\":\"price_kobo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isAvailable\",\"dbName\":\"is_available\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isDeleted\",\"dbName\":\"is_deleted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verificationBadge\",\"dbName\":\"verification_badge\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"VerificationBadge\",\"default\":\"pending\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"latitude\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"longitude\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"owner\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"PropertyToUser\",\"relationFromFields\":[\"ownerId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"images\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PropertyImage\",\"relationName\":\"PropertyToPropertyImage\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"savedBy\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SavedProperty\",\"relationName\":\"PropertyToSavedProperty\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reviews\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Review\",\"relationName\":\"PropertyToReview\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escrows\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EscrowTransaction\",\"relationName\":\"EscrowTransactionToProperty\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PropertyImage\":{\"dbName\":\"property_images\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"propertyId\",\"dbName\":\"property_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"thumbnail\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"property\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Property\",\"relationName\":\"PropertyToPropertyImage\",\"relationFromFields\":[\"propertyId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"SavedProperty\":{\"dbName\":\"saved_properties\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"propertyId\",\"dbName\":\"property_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"SavedPropertyToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"property\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Property\",\"relationName\":\"PropertyToSavedProperty\",\"relationFromFields\":[\"propertyId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"propertyId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"propertyId\"]}],\"isGenerated\":false},\"Review\":{\"dbName\":\"reviews\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reviewerId\",\"dbName\":\"reviewer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revieweeId\",\"dbName\":\"reviewee_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"propertyId\",\"dbName\":\"property_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escrowId\",\"dbName\":\"escrow_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ReviewType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rating\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"comment\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isVerified\",\"dbName\":\"is_verified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isPublished\",\"dbName\":\"is_published\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reviewer\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"ReviewsWritten\",\"relationFromFields\":[\"reviewerId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reviewee\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"ReviewsReceived\",\"relationFromFields\":[\"revieweeId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"property\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Property\",\"relationName\":\"PropertyToReview\",\"relationFromFields\":[\"propertyId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escrow\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EscrowTransaction\",\"relationName\":\"EscrowTransactionToReview\",\"relationFromFields\":[\"escrowId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"reviewerId\",\"escrowId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"reviewerId\",\"escrowId\"]}],\"isGenerated\":false},\"Verification\":{\"dbName\":\"verifications\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"VerificationType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"VerificationStatus\",\"default\":\"pending\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"documentUrl\",\"dbName\":\"document_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reviewerId\",\"dbName\":\"reviewer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reviewedAt\",\"dbName\":\"reviewed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToVerification\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"type\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"type\"]}],\"isGenerated\":false},\"EscrowTransaction\":{\"dbName\":\"escrow_transactions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"propertyId\",\"dbName\":\"property_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenantId\",\"dbName\":\"tenant_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"landlordId\",\"dbName\":\"landlord_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"agentId\",\"dbName\":\"agent_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"EscrowStatus\",\"default\":\"pending_payment\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amountKobo\",\"dbName\":\"amount_kobo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"platformFeeKobo\",\"dbName\":\"platform_fee_kobo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"landlordPayoutKobo\",\"dbName\":\"landlord_payout_kobo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentProvider\",\"dbName\":\"payment_provider\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"PaymentProvider\",\"default\":\"monnify\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentReference\",\"dbName\":\"payment_reference\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentAccessCode\",\"dbName\":\"payment_access_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"disputeReason\",\"dbName\":\"dispute_reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"disputedAt\",\"dbName\":\"disputed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"completedAt\",\"dbName\":\"completed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rentMonthly\",\"dbName\":\"rent_monthly\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payoutReference\",\"dbName\":\"payout_reference\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payoutTransferCode\",\"dbName\":\"payout_transfer_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isDeleted\",\"dbName\":\"is_deleted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"tenant\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"TenantEscrows\",\"relationFromFields\":[\"tenantId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"landlord\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"LandlordEscrows\",\"relationFromFields\":[\"landlordId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"agent\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"AgentEscrows\",\"relationFromFields\":[\"agentId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"property\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Property\",\"relationName\":\"EscrowTransactionToProperty\",\"relationFromFields\":[\"propertyId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TransactionLog\",\"relationName\":\"EscrowTransactionToTransactionLog\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reviews\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Review\",\"relationName\":\"EscrowTransactionToReview\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"instalments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RentInstalment\",\"relationName\":\"EscrowTransactionToRentInstalment\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"scoreEvents\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RentScoreEvent\",\"relationName\":\"EscrowTransactionToRentScoreEvent\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"TransactionLog\":{\"dbName\":\"transaction_logs\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escrowId\",\"dbName\":\"escrow_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fromStatus\",\"dbName\":\"from_status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EscrowStatus\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"toStatus\",\"dbName\":\"to_status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EscrowStatus\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actorId\",\"dbName\":\"actor_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escrow\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EscrowTransaction\",\"relationName\":\"EscrowTransactionToTransactionLog\",\"relationFromFields\":[\"escrowId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actor\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"TransactionLogToUser\",\"relationFromFields\":[\"actorId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Notification\":{\"dbName\":\"notifications\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"body\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"link\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isRead\",\"dbName\":\"is_read\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"channel\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"in_app\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"NotificationToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"RentInstalment\":{\"dbName\":\"rent_instalments\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escrowId\",\"dbName\":\"escrow_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"instalmentNumber\",\"dbName\":\"instalment_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"amountKobo\",\"dbName\":\"amount_kobo\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dueDate\",\"dbName\":\"due_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paidAt\",\"dbName\":\"paid_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"RentInstalmentStatus\",\"default\":\"scheduled\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"retryCount\",\"dbName\":\"retry_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"paymentReference\",\"dbName\":\"payment_reference\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"RentInstalmentToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escrow\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EscrowTransaction\",\"relationName\":\"EscrowTransactionToRentInstalment\",\"relationFromFields\":[\"escrowId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"escrowId\",\"instalmentNumber\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"escrowId\",\"instalmentNumber\"]}],\"isGenerated\":false},\"RentScoreEvent\":{\"dbName\":\"rent_score_events\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eventType\",\"dbName\":\"event_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RentScoreEventType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"delta\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"scoreAfter\",\"dbName\":\"score_after\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escrowId\",\"dbName\":\"escrow_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"RentScoreEventToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"escrow\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"EscrowTransaction\",\"relationName\":\"EscrowTransactionToRentScoreEvent\",\"relationFromFields\":[\"escrowId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"UserRole\":{\"values\":[{\"name\":\"tenant\",\"dbName\":null},{\"name\":\"landlord\",\"dbName\":null},{\"name\":\"agent\",\"dbName\":null},{\"name\":\"admin\",\"dbName\":null}],\"dbName\":null},\"VerificationType\":{\"values\":[{\"name\":\"nin\",\"dbName\":null},{\"name\":\"lasrera\",\"dbName\":null},{\"name\":\"esvarbon\",\"dbName\":null},{\"name\":\"niesv\",\"dbName\":null},{\"name\":\"aean\",\"dbName\":null},{\"name\":\"ercaan\",\"dbName\":null},{\"name\":\"redan\",\"dbName\":null},{\"name\":\"property_title\",\"dbName\":null}],\"dbName\":null},\"VerificationStatus\":{\"values\":[{\"name\":\"pending\",\"dbName\":null},{\"name\":\"approved\",\"dbName\":null},{\"name\":\"rejected\",\"dbName\":null}],\"dbName\":null},\"PropertyType\":{\"values\":[{\"name\":\"apartment\",\"dbName\":null},{\"name\":\"duplex\",\"dbName\":null},{\"name\":\"bungalow\",\"dbName\":null},{\"name\":\"studio\",\"dbName\":null},{\"name\":\"commercial\",\"dbName\":null}],\"dbName\":null},\"VerificationBadge\":{\"values\":[{\"name\":\"pending\",\"dbName\":null},{\"name\":\"agent_verified\",\"dbName\":null},{\"name\":\"title_confirmed\",\"dbName\":null},{\"name\":\"fully_verified\",\"dbName\":null}],\"dbName\":null},\"ReviewType\":{\"values\":[{\"name\":\"property\",\"dbName\":null},{\"name\":\"landlord\",\"dbName\":null},{\"name\":\"agent\",\"dbName\":null}],\"dbName\":null},\"PaymentProvider\":{\"values\":[{\"name\":\"monnify\",\"dbName\":null},{\"name\":\"paystack\",\"dbName\":null}],\"dbName\":null},\"EscrowStatus\":{\"values\":[{\"name\":\"pending_payment\",\"dbName\":null},{\"name\":\"funds_held\",\"dbName\":null},{\"name\":\"docs_verified\",\"dbName\":null},{\"name\":\"key_handover_pending\",\"dbName\":null},{\"name\":\"completed\",\"dbName\":null},{\"name\":\"refunded\",\"dbName\":null},{\"name\":\"cancelled\",\"dbName\":null},{\"name\":\"disputed\",\"dbName\":null}],\"dbName\":null},\"RentInstalmentStatus\":{\"values\":[{\"name\":\"scheduled\",\"dbName\":null},{\"name\":\"paid\",\"dbName\":null},{\"name\":\"overdue\",\"dbName\":null},{\"name\":\"missed\",\"dbName\":null}],\"dbName\":null},\"RentScoreEventType\":{\"values\":[{\"name\":\"on_time_payment\",\"dbName\":null},{\"name\":\"late_payment\",\"dbName\":null},{\"name\":\"missed_payment\",\"dbName\":null},{\"name\":\"escrow_completed\",\"dbName\":null},{\"name\":\"dispute_raised\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-1.1.x.so.node");
path.join(process.cwd(), "generated/client/libquery_engine-debian-openssl-1.1.x.so.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-rhel-openssl-3.0.x.so.node");
path.join(process.cwd(), "generated/client/libquery_engine-rhel-openssl-3.0.x.so.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "generated/client/schema.prisma")
