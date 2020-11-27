export const NETWORKS = {
  "1": "Main Net",
  "2": "Deprecated Morden test network",
  "3": "Ropsten test network",
  "4": "Rinkeby test network",
  "42": "Kovan test network",
  "4447": "Truffle Develop Network",
  "5777": "Ganache Blockchain",
};

export const WEEKDAYS = {
  "0": "Mon",
  "1": "Tue",
  "2": "Wed",
  "3": "Thu",
  "4": "Fri",
  "5": "Sat",
  "6": "Sun",
};

export const MONTHS = {
  "0": "Jan",
  "1": "Feb",
  "2": "Mar",
  "3": "Apr",
  "4": "May",
  "5": "Jun",
  "6": "Jul",
  "7": "Aug",
  "8": "Sep",
  "9": "Oct",
  "10": "Nov",
  "11": "Dec",
};

// General constants
export const IPFS_TIMEOUT = 20000 // in ms
export const STARTING_BLOCK = 7400000;
export const AVERAGE_TIME_PER_BLOCK = 15000; // in ms
export const AVERAGE_TIME_PER_BLOCK_LOCAL = 100; // in ms
export const AVERAGE_TIME_WAITING_FOR_RECEIPT = 3000; // in ms
export const MAX_TICKETS_PER_PERSON = 5;
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

// General messages
export const PROCESSING = 'Processing...';
export const WAITING_FOR_SIGNATURE = 'Please sign the transaction.';
export const TRANSACTION_DENIED = 'Transaction denied due to user interruption';
export const DEFAULT_ERROR = 'Oops! Looks like we hit a roadblock!';

// Pinata uploading
export const UPLOADING_TO_IPFS = 'Please wait - The data is being uploaded to IPFS.';
export const UPLOADED_TO_IPFS = 'The data was successfully uploaded to IPFS.';

// Progress bar states
export const PROGRESS_DETERMINATE = 'determinate';
export const PROGRESS_INDETERMINATE = 'indeterminate';

// Events
export const EVENT_DEPLOYING = 'Please wait - The Event contract is being deployed...';
export const EVENT_DEPLOYED = 'The event was successfully deployed.';
export const EVENT_METADATA_CHANGE = 'Please wait - The invocation is being processed.';
export const EVENT_METADATA_CHANGE_SUCCESSFUL = 'The metadata change was successful.';
export const EVENT_MAX_TICKETS_CHANGE = 'Please wait - The invocation is being processed.'
export const EVENT_MAX_TICKETS_CHANGE_SUCCESSFUL = 'The change of the maximal number of tickets per person was successfully changed.'

// Tickets
export const TICKETS_CREATING = 'Please wait - The non-presale tickets are being created.';
export const TICKETS_CREATING_PRESALE = 'Please wait - The presale tickets are being created.';
export const TICKETS_CREATED = 'The non-presale tickets were successfully created.';
export const TICKETS_CREATED_PRESALE = 'The presale tickets were successfully created.';
export const TICKETS_CREATED_ALL = 'All tickets were successfully created';
export const TICKETS_WAITING_FOR_SIGNATURE = 'Please sign the transaction for the non-presale tickets.';
export const TICKETS_WAITING_FOR_SIGNATURE_PRESALE = 'Please sign the transaction for the presale tickets.';

// export const WAITING_FOR_SIGNATURE_PRESALE = 'Please sign the transaction for the presale tickets.';
// export const WAITING_FOR_SIGNATURE_NON_PRESALE = 'Please sign the transaction for the tickets without presale.';

// Approver
export const APPROVER_REGISTRATION = 'Please wait - Your registration is being processed.';
export const APPROVER_REGISTRATION_SUCCESSFUL = 'You were successfully registered as Approver.';

// Identity verification
export const IDENTITY_VERIFICATION = 'Please wait - The account verification is being processed.';
export const IDENTITY_VERIFICATION_SUCCESSFUL = 'The account verification was successful.';
