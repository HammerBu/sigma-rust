
import Foundation
import ErgoLibC

/// NiPoPow proof
class NipopowProof {
    internal var pointer: NipopowProofPtr
    
    /// Parse ``NipopowProof`` from JSON
    init(withJson json: String) throws {
        var ptr: NipopowProofPtr?
        let error = json.withCString { cs in
            ergo_lib_nipopow_proof_from_json(cs, &ptr)
        }
        try checkError(error)
        self.pointer = ptr!
    }
    
    /// Implementation of the ≥ algorithm from [`KMZ17`], see Algorithm 4
    ///
    /// [`KMZ17`]: https://fc20.ifca.ai/preproceedings/74.pdf
    func isBetterThan(otherProof: NipopowProof) throws -> Bool {
        let res = ergo_lib_nipopow_proof_is_better_than(self.pointer, otherProof.pointer)
        try checkError(res.error)
        return res.value
    }
    
    /// JSON representation as text
    func toJSON() throws -> JSON? {
        var cStr: UnsafePointer<CChar>?
        let error = ergo_lib_nipopow_proof_to_json(self.pointer, &cStr)
        try checkError(error)
        let str = String(cString: cStr!)
        ergo_lib_delete_string(UnsafeMutablePointer(mutating: cStr))
        return try str.data(using: .utf8, allowLossyConversion: false).map {
            try JSON(data: $0)
        }
    }
    
    deinit {
        ergo_lib_nipopow_proof_delete(self.pointer)
    }
}

/// A verifier for PoPoW proofs. During its lifetime, it processes many proofs with the aim of
/// deducing at any given point what is the best (sub)chain rooted at the specified genesis.
class NipopowVerifier {
    internal var pointer: NipopowVerifierPtr
    
    /// Create new instance
    init(withGenesisBlockId genesisBlockId: BlockId) {
        var ptr: NipopowProofPtr?
        ergo_lib_nipopow_verifier_new(genesisBlockId.pointer, &ptr)
        self.pointer = ptr!
    }
    
    /// Returns chain of `BlockHeader`s from the best proof.
    func bestChain() -> BlockHeaders {
        var ptr: BlockHeadersPtr?
        ergo_lib_nipopow_verifier_best_chain(self.pointer, &ptr)
        return BlockHeaders(withRawPointer: ptr!)
    }
    
    /// Process given proof
    func process(newProof: NipopowProof) throws {
        let error = ergo_lib_nipopow_verifier_process(self.pointer, newProof.pointer)
        try checkError(error)
    }
    
    deinit {
        ergo_lib_nipopow_verifier_delete(self.pointer)
    }
}
