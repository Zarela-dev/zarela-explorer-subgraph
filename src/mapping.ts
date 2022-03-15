import {
	Request,
	Confirmation,
	Contribution,
	RequestDetail,
	Transaction,
} from '../generated/schema';
import {
	orderRegistered,
	contributed,
	signalsApproved,
	SubmitNewRequestCall,
	ContributeCall,
	ConfirmContributorCall,
	Transfer as TransferEvent,
	Approval as ApprovalEvent,
} from '../generated/ZarelaContract/ZarelaContract';

export function handleTransfer(event: TransferEvent): void {
	let transaction = Transaction.load(event.transaction.hash.toHexString());

	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHexString());
	}

	transaction.from = event.transaction.from;
	transaction.to = event.transaction.to;
	transaction.timestamp = event.block.timestamp;
	transaction.method= 'Transfer';
	transaction.value= event.transaction.value;
	transaction.gasLimit= event.transaction.gasLimit;
	transaction.gasPrice= event.transaction.gasPrice;
	transaction.blockNumber= event.block.number;

	transaction.save()
}

export function handleApproval(event: ApprovalEvent): void {
	let transaction = Transaction.load(event.transaction.hash.toHexString());
	
	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHexString());
	}
	
	transaction.from = event.transaction.from;
	transaction.to = event.transaction.to;
	transaction.timestamp = event.block.timestamp;
	transaction.method= 'Approval';
	transaction.value= event.transaction.value;
	transaction.gasLimit= event.transaction.gasLimit;
	transaction.gasPrice= event.transaction.gasPrice;
	transaction.blockNumber= event.block.number;

	transaction.save()
}

export function handleOrderRegistered(event: orderRegistered): void {
	let requestDetail = RequestDetail.load(event.transaction.hash.toHexString());
	let transaction = Transaction.load(event.transaction.hash.toHexString());
	let request = Request.load(event.params.orderId.toString());
	
	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHexString());
	}
	if (requestDetail == null) {
		requestDetail = new RequestDetail(event.transaction.hash.toHexString());
	}
	if(request == null) {
		request = new Request(event.params.orderId.toString());
	}

	transaction.from = event.transaction.from;
	transaction.to = event.transaction.to;
	transaction.timestamp = event.block.timestamp;
	transaction.method= 'Create Request';
	transaction.value = event.transaction.value;
	transaction.gasLimit = event.transaction.gasLimit;
	transaction.gasPrice = event.transaction.gasPrice;
	transaction.blockNumber = event.block.number;

	requestDetail.requesterAddress = event.params.owner;
	requestDetail.requestID = event.params.orderId.toString();
	requestDetail.blockNumber = event.block.number;
	request.txHash = event.transaction.hash.toHexString();
	request.requestNumber = event.params.orderId;
	request.timestamp = event.block.timestamp;
	
	transaction.save()
	request.save();
	requestDetail.save();
}

export function handleContributionEvent(event: contributed): void {
	let transaction = Transaction.load(event.transaction.hash.toHexString());
	let contribution = Contribution.load(event.transaction.hash.toHexString());
	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHexString());
	}
	if (contribution == null) {
		contribution = new Contribution(event.transaction.hash.toHexString());
	}
	contribution.difficulty = event.params.difficulty;
	contribution.requestID = event.params.orderId.toString();
	contribution.blockNumber = event.block.number;

	transaction.from = event.transaction.from;
	transaction.to = event.transaction.to;
	transaction.timestamp = event.block.timestamp;
	transaction.method= 'Contribution';
	transaction.value= event.transaction.value;
	transaction.gasLimit= event.transaction.gasLimit;
	transaction.gasPrice= event.transaction.gasPrice;
	transaction.blockNumber= event.block.number;

	transaction.save();
	contribution.save();
}

export function handleConfirmationEvent(event: signalsApproved): void {
	let transaction = Transaction.load(event.transaction.hash.toHexString());
	if (transaction == null) {
		transaction = new Transaction(event.transaction.hash.toHexString());
	}
	let confirmation = Confirmation.load(event.transaction.hash.toHexString());
	if (confirmation == null) {
		confirmation = new Confirmation(event.transaction.hash.toHexString());
	}
	confirmation.confirmCount = event.params.confirmCount;
	confirmation.blockNumber = event.block.number;
	
	transaction.from = event.transaction.from;
	transaction.to = event.transaction.to;
	transaction.timestamp = event.block.timestamp;
	transaction.method = 'Confirmation';
	transaction.value = event.transaction.value;
	transaction.gasLimit = event.transaction.gasLimit;
	transaction.gasPrice = event.transaction.gasPrice;
	transaction.blockNumber = event.block.number;

	confirmation.save();
}

export function handleNewRequest(call: SubmitNewRequestCall): void {
	let requestDetail = RequestDetail.load(call.transaction.hash.toHexString());

	if (requestDetail == null) {
		requestDetail = new RequestDetail(call.transaction.hash.toHexString());
	}
	
	requestDetail.title = call.inputs._orderTitle;
	requestDetail.description = call.inputs._description;
	requestDetail.requesterAddress = call.transaction.from;
	requestDetail.angelTokenPay = call.inputs._tokenPerContributor;
	requestDetail.laboratoryTokenPay = call.inputs._tokenPerLaboratory;
	requestDetail.totalContributors = call.inputs._totalContributors; // set by mage
	requestDetail.zpaper = call.inputs._zPaper;
	requestDetail.timestamp = call.block.timestamp;
	requestDetail.categories = call.inputs._zarelaCategory;
	requestDetail.totalTokenPay = call.inputs._tokenPerLaboratory.plus(call.inputs._tokenPerContributor);

	requestDetail.save();
}

export function handleContribution(call: ContributeCall): void {
	let contribution = Contribution.load(call.transaction.hash.toHexString());
	if (contribution == null) {
		contribution = new Contribution(call.transaction.hash.toHexString());
	}
	contribution.contributorAddress = call.inputs._contributorAddress;
	contribution.hubAddress = call.inputs._laboratoryAddress;
	contribution.requestID = call.inputs._orderId.toString();
	contribution.contributorGetsReward = call.inputs._isContributorGainReward;
	contribution.mageAddress = call.inputs._orderOwner;
	contribution.fileCID = call.inputs._ipfsHash;
	contribution.metadataCID = call.inputs._encryptionKey;
	contribution.timestamp = call.block.timestamp;

	contribution.save();
}

export function handleConfirmation(call: ConfirmContributorCall): void {
	let confirmation = Confirmation.load(call.transaction.hash.toHexString());
	if (confirmation == null) {
		confirmation = new Confirmation(call.transaction.hash.toHexString());
	}
	confirmation.requestID = call.inputs._orderId.toString()
	confirmation.originalIndexes = call.inputs._index;
	confirmation.timestamp = call.block.timestamp;

	confirmation.save();
}