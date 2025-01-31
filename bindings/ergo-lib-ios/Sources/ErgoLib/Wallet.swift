import Foundation
import ErgoLibC

class Wallet {
    internal var pointer: WalletPtr
    
    /// Create ``Wallet`` instance loading secret key from mnemonic. Throws error if a DlogSecretKey cannot be
    /// parsed from the provided phrase
    init(mnemonicPhrase : String, mnemonicPass: String) throws {
        var ptr: WalletPtr?
        let error =
            mnemonicPhrase.withCString{phrase -> ErrorPtr? in
                mnemonicPass.withCString{pass in
                    ergo_lib_wallet_from_mnemonic(phrase, pass, &ptr)
                }
            }
        try checkError(error)
        self.pointer = ptr!
    }
    
    /// Create ``Wallet`` from secrets
    init(secrets: SecretKeys) {
        var ptr: WalletPtr?
        ergo_lib_wallet_from_secrets(secrets.pointer, &ptr)
        self.pointer = ptr!
    }

    /// Add a secret to the wallets prover
    func addSecret(secret: SecretKey) throws {
        let error = ergo_lib_wallet_add_secret(self.pointer, secret.pointer)
        try checkError(error)
    }
    
    /// Sign a transaction
    func signTransaction(
        stateContext: ErgoStateContext,
        unsignedTx: UnsignedTransaction,
        boxesToSpend: ErgoBoxes,
        dataBoxes: ErgoBoxes
    ) throws -> Transaction {
        var ptr: TransactionPtr?
        let error = ergo_lib_wallet_sign_transaction(self.pointer, stateContext.pointer, unsignedTx.pointer, boxesToSpend.pointer, dataBoxes.pointer, &ptr)
        try checkError(error)
        return Transaction(withRawPointer: ptr!)
    }
    
    /// Sign a multi signature transaction
    func signTransactionMulti(
        stateContext: ErgoStateContext,
        unsignedTx: UnsignedTransaction,
        boxesToSpend: ErgoBoxes,
        dataBoxes: ErgoBoxes,
        txHints: TransactionHintsBag
    ) throws -> Transaction {
        var ptr: TransactionPtr?
        let error = ergo_lib_wallet_sign_transaction_multi(
            self.pointer,
            stateContext.pointer,
            unsignedTx.pointer,
            boxesToSpend.pointer,
            dataBoxes.pointer,
            txHints.pointer,
            &ptr
        )
        try checkError(error)
        return Transaction(withRawPointer: ptr!)
    }
    
    /// Signs a reduced transaction (generating proofs for inputs)
    func signReducedTransaction(
        reducedTx: ReducedTransaction
    ) throws -> Transaction {
        var ptr: TransactionPtr?
        let error = ergo_lib_wallet_sign_reduced_transaction(self.pointer, reducedTx.pointer, &ptr)
        try checkError(error)
        return Transaction(withRawPointer: ptr!)
    }
    
    /// Signs a multi signature reduced transaction
    func signReducedTransactionMulti(
        reducedTx: ReducedTransaction,
        txHints: TransactionHintsBag
    ) throws -> Transaction {
        var ptr: TransactionPtr?
        let error = ergo_lib_wallet_sign_reduced_transaction_multi(
            self.pointer,
            reducedTx.pointer,
            txHints.pointer,
            &ptr
        )
        try checkError(error)
        return Transaction(withRawPointer: ptr!)
    }
    
    /// Generate Commitments for unsigned tx
    func generateCommitments(
        stateContext: ErgoStateContext,
        unsignedTx: UnsignedTransaction,
        boxesToSpend: ErgoBoxes,
        dataBoxes: ErgoBoxes
    ) throws -> TransactionHintsBag {
        var ptr: TransactionHintsBagPtr?
        let error = ergo_lib_wallet_generate_commitments(
            self.pointer,
            stateContext.pointer,
            unsignedTx.pointer,
            boxesToSpend.pointer,
            dataBoxes.pointer,
            &ptr
        )
        try checkError(error)
        return TransactionHintsBag(withRawPointer: ptr!)
    }
    
    /// Generate Commitments for reduced transaction
    func generateCommitmentsForReducedTransaction(
        reducedTx: ReducedTransaction
    ) throws -> TransactionHintsBag {
        var ptr: TransactionHintsBagPtr?
        let error = ergo_lib_wallet_generate_commitments_for_reduced_transaction(
            self.pointer,
            reducedTx.pointer,
            &ptr
        )
        try checkError(error)
        return TransactionHintsBag(withRawPointer: ptr!)
    }
    
    deinit {
        ergo_lib_wallet_delete(self.pointer)
    }
}
