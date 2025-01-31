import { expect, assert } from 'chai';

import { generate_block_headers } from './utils';

import * as ergo from "..";
let ergo_wasm;
beforeEach(async () => {
  ergo_wasm = await ergo;
});


it('TxBuilder test', async () => {
  const recipient = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const unspent_boxes = ergo_wasm.ErgoBoxes.from_boxes_json([
    {
      "boxId": "e56847ed19b3dc6b72828fcfb992fdf7310828cf291221269b7ffc72fd66706e",
      "value": 67500000000,
      "ergoTree": "100204a00b08cd021dde34603426402615658f1d970cfa7c7bd92ac81a8b16eeebff264d59ce4604ea02d192a39a8cc7a70173007301",
      "assets": [],
      "creationHeight": 284761,
      "additionalRegisters": {},
      "transactionId": "9148408c04c2e38a6402a7950d6157730fa7d49e9ab3b9cadec481d7769918e9",
      "index": 1
    }
  ]);
  const contract = ergo_wasm.Contract.pay_to_address(recipient);
  const outbox_value = ergo_wasm.BoxValue.SAFE_USER_MIN();
  const outbox = new ergo_wasm.ErgoBoxCandidateBuilder(outbox_value, contract, 0).build();
  const tx_outputs = new ergo_wasm.ErgoBoxCandidates(outbox);
  const fee = ergo_wasm.TxBuilder.SUGGESTED_TX_FEE();
  const change_address = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const min_change_value = ergo_wasm.BoxValue.SAFE_USER_MIN();
  const data_inputs = new ergo_wasm.DataInputs();
  const box_selector = new ergo_wasm.SimpleBoxSelector();
  const target_balance = ergo_wasm.BoxValue.from_i64(outbox_value.as_i64().checked_add(fee.as_i64()));
  const box_selection = box_selector.select(unspent_boxes, target_balance, new ergo_wasm.Tokens());
  const tx_builder = ergo_wasm.TxBuilder.new(box_selection, tx_outputs, 0, fee, change_address, min_change_value);
  tx_builder.set_data_inputs(data_inputs);
  const tx = tx_builder.build();
  assert(tx != null);
});

it('sign transaction', async () => {
  const sk = ergo_wasm.SecretKey.random_dlog();
  // simulate existing box guarded by the sk key
  const input_contract = ergo_wasm.Contract.pay_to_address(sk.get_address());
  const input_box = new ergo_wasm.ErgoBox(ergo_wasm.BoxValue.from_i64(ergo_wasm.I64.from_str('1000000000')), 0, input_contract, ergo_wasm.TxId.zero(), 0, new ergo_wasm.Tokens());
  // create a transaction that spends the "simulated" box
  const recipient = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const unspent_boxes = new ergo_wasm.ErgoBoxes(input_box);
  const contract = ergo_wasm.Contract.pay_to_address(recipient);
  const outbox_value = ergo_wasm.BoxValue.SAFE_USER_MIN();
  const outbox = new ergo_wasm.ErgoBoxCandidateBuilder(outbox_value, contract, 0).build();
  const tx_outputs = new ergo_wasm.ErgoBoxCandidates(outbox);
  const fee = ergo_wasm.TxBuilder.SUGGESTED_TX_FEE();
  const change_address = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const min_change_value = ergo_wasm.BoxValue.SAFE_USER_MIN();
  const box_selector = new ergo_wasm.SimpleBoxSelector();
  const target_balance = ergo_wasm.BoxValue.from_i64(outbox_value.as_i64().checked_add(fee.as_i64()));
  const box_selection = box_selector.select(unspent_boxes, target_balance, new ergo_wasm.Tokens());
  const tx_builder = ergo_wasm.TxBuilder.new(box_selection, tx_outputs, 0, fee, change_address, min_change_value);
  const tx = tx_builder.build();
  // smoke test for to_js_eip12
  assert(tx.to_js_eip12() != null);
  const tx_data_inputs = ergo_wasm.ErgoBoxes.from_boxes_json([]);
  const block_headers = generate_block_headers();
  const pre_header = ergo_wasm.PreHeader.from_block_header(block_headers.get(0));
  const ctx = new ergo_wasm.ErgoStateContext(pre_header, block_headers);
  const sks = new ergo_wasm.SecretKeys();
  sks.add(sk);
  const wallet = ergo_wasm.Wallet.from_secrets(sks);
  const signed_tx = wallet.sign_transaction(ctx, tx, unspent_boxes, tx_data_inputs);
  assert(signed_tx != null);
  // smoke test for to_js_eip12
  assert(signed_tx.to_js_eip12() != null);
});

it('TxBuilder mint token test', async () => {
  const recipient = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const unspent_boxes = ergo_wasm.ErgoBoxes.from_boxes_json([
    {
      "boxId": "e56847ed19b3dc6b72828fcfb992fdf7310828cf291221269b7ffc72fd66706e",
      "value": 67500000000,
      "ergoTree": "100204a00b08cd021dde34603426402615658f1d970cfa7c7bd92ac81a8b16eeebff264d59ce4604ea02d192a39a8cc7a70173007301",
      "assets": [],
      "creationHeight": 284761,
      "additionalRegisters": {},
      "transactionId": "9148408c04c2e38a6402a7950d6157730fa7d49e9ab3b9cadec481d7769918e9",
      "index": 1
    }
  ]);
  const fee = ergo_wasm.TxBuilder.SUGGESTED_TX_FEE();
  const outbox_value = ergo_wasm.BoxValue.SAFE_USER_MIN();
  const target_balance = ergo_wasm.BoxValue.from_i64(outbox_value.as_i64().checked_add(fee.as_i64()));
  const box_selector = new ergo_wasm.SimpleBoxSelector();
  const box_selection = box_selector.select(unspent_boxes, target_balance, new ergo_wasm.Tokens());
  const contract = ergo_wasm.Contract.pay_to_address(recipient);
  const token_id = ergo_wasm.TokenId.from_box_id(box_selection.boxes().get(0).box_id());
  const box_builder = new ergo_wasm.ErgoBoxCandidateBuilder(outbox_value, contract, 0);
  const token = new ergo_wasm.Token(token_id, ergo_wasm.TokenAmount.from_i64(ergo_wasm.I64.from_str('1')));
  box_builder.mint_token(token, "TKN", "token desc", 2)
  const outbox = box_builder.build();
  const tx_outputs = new ergo_wasm.ErgoBoxCandidates(outbox);
  const change_address = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const min_change_value = ergo_wasm.BoxValue.SAFE_USER_MIN();
  const data_inputs = new ergo_wasm.DataInputs();
  const tx_builder = ergo_wasm.TxBuilder.new(box_selection, tx_outputs, 0, fee, change_address, min_change_value);
  tx_builder.set_data_inputs(data_inputs);
  const tx = tx_builder.build();
  assert(tx != null);
});

it('TxBuilder burn token test', async () => {
  const recipient = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const unspent_boxes = ergo_wasm.ErgoBoxes.from_boxes_json([
    {
      "boxId": "0cf7b9e71961cc473242de389c8e594a4e5d630ddd2e4e590083fb0afb386341",
      "value": 11491500000,
      "ergoTree": "100f040005c801056404000e2019719268d230fd9093e4db0e2e42a07883ffe976e77c7419efc1bb218a05d4ba04000500043c040204c096b10204020101040205c096b1020400d805d601b2a5730000d602e4c6a70405d6039c9d720273017302d604b5db6501fed9010463ededed93e4c67204050ec5a7938cb2db6308720473030001730492e4c672040605997202720390e4c6720406059a72027203d605b17204ea02d1edededededed93cbc27201e4c6a7060e917205730593db63087201db6308a793e4c6720104059db072047306d9010641639a8c720601e4c68c72060206057e72050593e4c6720105049ae4c6a70504730792c1720199c1a77e9c9a720573087309058cb072048602730a730bd901063c400163d802d6088c720601d6098c72080186029a7209730ceded8c72080293c2b2a5720900d0cde4c68c720602040792c1b2a5720900730d02b2ad7204d9010663cde4c672060407730e00",
      "assets": [
        {
          "tokenId": "19475d9a78377ff0f36e9826cec439727bea522f6ffa3bda32e20d2f8b3103ac",
          "amount": 1
        }
      ],
      "creationHeight": 348198,
      "additionalRegisters": {
        "R4": "059acd9109",
        "R5": "04f2c02a",
        "R6": "0e20277c78751ff6f68d4dcd082eeea9506324911a875b6b9cd4d177d4fcab061327"
      },
      "transactionId": "5ed0e572a8c097b053965519a696f413f7be02754345e8ed650377e29a6dedb3",
      "index": 0
    }
  ]);
  const token_id = ergo_wasm.TokenId.from_str("19475d9a78377ff0f36e9826cec439727bea522f6ffa3bda32e20d2f8b3103ac");
  const token = new ergo_wasm.Token(token_id, ergo_wasm.TokenAmount.from_i64(ergo_wasm.I64.from_str('1')));
  const box_selector = new ergo_wasm.SimpleBoxSelector();
  let tokens = new ergo_wasm.Tokens();
  tokens.add(token);
  const fee = ergo_wasm.TxBuilder.SUGGESTED_TX_FEE();
  const outbox_value = ergo_wasm.BoxValue.SAFE_USER_MIN();
  const target_balance = ergo_wasm.BoxValue.from_i64(outbox_value.as_i64().checked_add(fee.as_i64()));
  // select tokens from inputs
  const box_selection = box_selector.select(unspent_boxes, target_balance, tokens);
  const contract = ergo_wasm.Contract.pay_to_address(recipient);
  // but don't put selected tokens in the output box (burn them)
  const box_builder = new ergo_wasm.ErgoBoxCandidateBuilder(outbox_value, contract, 0);
  const outbox = box_builder.build();
  const tx_outputs = new ergo_wasm.ErgoBoxCandidates(outbox);
  const change_address = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const min_change_value = ergo_wasm.BoxValue.SAFE_USER_MIN();
  const data_inputs = new ergo_wasm.DataInputs();
  const tx_builder = ergo_wasm.TxBuilder.new(box_selection, tx_outputs, 0, fee, change_address, min_change_value);
  tx_builder.set_data_inputs(data_inputs);
  const tx = tx_builder.build();
  assert(tx != null);
});

it('use signed tx outputs as inputs in a new tx', async () => {
  const sk = ergo_wasm.SecretKey.random_dlog();
  // simulate existing box guarded by the sk key
  const input_contract = ergo_wasm.Contract.pay_to_address(sk.get_address());
  const input_box = new ergo_wasm.ErgoBox(ergo_wasm.BoxValue.from_i64(ergo_wasm.I64.from_str('100000000000')), 0, input_contract, ergo_wasm.TxId.zero(), 0, new ergo_wasm.Tokens());
  // create a transaction that spends the "simulated" box
  const recipient = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const unspent_boxes = new ergo_wasm.ErgoBoxes(input_box);
  const contract = ergo_wasm.Contract.pay_to_address(recipient);
  const outbox_value = ergo_wasm.BoxValue.from_i64(ergo_wasm.I64.from_str('10000000000'));
  const outbox = new ergo_wasm.ErgoBoxCandidateBuilder(outbox_value, contract, 0).build();
  const tx_outputs = new ergo_wasm.ErgoBoxCandidates(outbox);
  const fee = ergo_wasm.TxBuilder.SUGGESTED_TX_FEE();
  const change_address = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const min_change_value = ergo_wasm.BoxValue.SAFE_USER_MIN();
  const box_selector = new ergo_wasm.SimpleBoxSelector();
  const target_balance = ergo_wasm.BoxValue.from_i64(outbox_value.as_i64().checked_add(fee.as_i64()));
  const box_selection = box_selector.select(unspent_boxes, target_balance, new ergo_wasm.Tokens());
  const tx_builder = ergo_wasm.TxBuilder.new(box_selection, tx_outputs, 0, fee, change_address, min_change_value);
  const tx = tx_builder.build();
  const tx_data_inputs = ergo_wasm.ErgoBoxes.from_boxes_json([]);
  const block_headers = generate_block_headers();
  const pre_header = ergo_wasm.PreHeader.from_block_header(block_headers.get(0));
  const ctx = new ergo_wasm.ErgoStateContext(pre_header, block_headers);
  const sks = new ergo_wasm.SecretKeys();
  sks.add(sk);
  const wallet = ergo_wasm.Wallet.from_secrets(sks);
  const signed_tx = wallet.sign_transaction(ctx, tx, unspent_boxes, tx_data_inputs);
  assert(signed_tx != null);
  // new tx
  const new_outbox_value = ergo_wasm.BoxValue.from_i64(ergo_wasm.I64.from_str('1000000000'));
  const new_target_balance = ergo_wasm.BoxValue.from_i64(new_outbox_value.as_i64().checked_add(fee.as_i64()));
  const new_box_selection = box_selector.select(signed_tx.outputs(), new_target_balance, new ergo_wasm.Tokens());
  const new_outbox = new ergo_wasm.ErgoBoxCandidateBuilder(new_outbox_value, contract, 0).build();
  const new_tx_outputs = new ergo_wasm.ErgoBoxCandidates(new_outbox);
  const new_tx_builder = ergo_wasm.TxBuilder.new(new_box_selection, new_tx_outputs, 0, fee, change_address, min_change_value);
  const new_tx = new_tx_builder.build();
  assert(new_tx != null);
});

it('Transaction::from_unsigned_tx test', async () => {
  const recipient = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const unspent_boxes = ergo_wasm.ErgoBoxes.from_boxes_json([
    {
      "boxId": "e56847ed19b3dc6b72828fcfb992fdf7310828cf291221269b7ffc72fd66706e",
      "value": 67500000000,
      "ergoTree": "100204a00b08cd021dde34603426402615658f1d970cfa7c7bd92ac81a8b16eeebff264d59ce4604ea02d192a39a8cc7a70173007301",
      "assets": [],
      "creationHeight": 284761,
      "additionalRegisters": {},
      "transactionId": "9148408c04c2e38a6402a7950d6157730fa7d49e9ab3b9cadec481d7769918e9",
      "index": 1
    }
  ]);
  const contract = ergo_wasm.Contract.pay_to_address(recipient);
  const outbox_value = ergo_wasm.BoxValue.SAFE_USER_MIN();
  const outbox = new ergo_wasm.ErgoBoxCandidateBuilder(outbox_value, contract, 0).build();
  const tx_outputs = new ergo_wasm.ErgoBoxCandidates(outbox);
  const fee = ergo_wasm.TxBuilder.SUGGESTED_TX_FEE();
  const change_address = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const min_change_value = ergo_wasm.BoxValue.SAFE_USER_MIN();
  const data_inputs = new ergo_wasm.DataInputs();
  const box_selector = new ergo_wasm.SimpleBoxSelector();
  const target_balance = ergo_wasm.BoxValue.from_i64(outbox_value.as_i64().checked_add(fee.as_i64()));
  const box_selection = box_selector.select(unspent_boxes, target_balance, new ergo_wasm.Tokens());
  const tx_builder = ergo_wasm.TxBuilder.new(box_selection, tx_outputs, 0, fee, change_address, min_change_value);
  tx_builder.set_data_inputs(data_inputs);
  const tx = tx_builder.build();
  assert(tx != null);
  const proof = new Uint8Array([1, 1, 2, 255]);
  const signed_tx = ergo_wasm.Transaction.from_unsigned_tx(tx, [proof]);
  assert(signed_tx != null);
  assert(signed_tx.inputs().get(0).spending_proof().proof().toString() == proof.toString());
});

it('signing multi signature transaction', async () => {
  const alice_secret = ergo_wasm.SecretKey.dlog_from_bytes(Uint8Array.from(Buffer.from("e726ad60a073a49f7851f4d11a83de6c9c7f99e17314fcce560f00a51a8a3d18", "hex")));
  const bob_secret = ergo_wasm.SecretKey.dlog_from_bytes(Uint8Array.from(Buffer.from("9e6616b4e44818d21b8dfdd5ea87eb822480e7856ab910d00f5834dc64db79b3", "hex")));
  const alice_pk_bytes = Uint8Array.from(Buffer.from("cd03c8e1527efae4be9868cea6767157fcccac66489842738efed0a302e4f81710d0", "hex"));
  const bob_pk_bytes = Uint8Array.from(Buffer.from("cd0247eb7cf009addc51892932c05c2a237c86c92f4982307a1af240a08c88270348", "hex"));
  // Pay 2 Script address of a multi_sig contract with contract { alicePK && bobPK }
  const multi_sig_address = ergo_wasm.Address.from_testnet_str('JryiCXrc7x5D8AhS9DYX1TDzW5C5mT6QyTMQaptF76EQkM15cetxtYKq3u6LymLZLVCyjtgbTKFcfuuX9LLi49Ec5m2p6cwsg5NyEsCQ7na83yEPN');
  const input_contract = ergo_wasm.Contract.pay_to_address(multi_sig_address);
  const input_box = new ergo_wasm.ErgoBox(ergo_wasm.BoxValue.from_i64(ergo_wasm.I64.from_str('1000000000')), 0, input_contract, ergo_wasm.TxId.zero(), 0, new ergo_wasm.Tokens());
  // create a transaction that spends the "simulated" box
  const recipient = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const unspent_boxes = new ergo_wasm.ErgoBoxes(input_box);
  const contract = ergo_wasm.Contract.pay_to_address(recipient);
  const outbox_value = ergo_wasm.BoxValue.SAFE_USER_MIN();
  const outbox = new ergo_wasm.ErgoBoxCandidateBuilder(outbox_value, contract, 0).build();
  const tx_outputs = new ergo_wasm.ErgoBoxCandidates(outbox);
  const fee = ergo_wasm.TxBuilder.SUGGESTED_TX_FEE();
  const change_address = ergo_wasm.Address.from_testnet_str('3WvsT2Gm4EpsM9Pg18PdY6XyhNNMqXDsvJTbbf6ihLvAmSb7u5RN');
  const min_change_value = ergo_wasm.BoxValue.SAFE_USER_MIN();
  const box_selector = new ergo_wasm.SimpleBoxSelector();
  const target_balance = ergo_wasm.BoxValue.from_i64(outbox_value.as_i64().checked_add(fee.as_i64()));
  const box_selection = box_selector.select(unspent_boxes, target_balance, new ergo_wasm.Tokens());
  const tx_builder = ergo_wasm.TxBuilder.new(box_selection, tx_outputs, 0, fee, change_address, min_change_value);
  const tx = tx_builder.build();
  const tx_data_inputs = ergo_wasm.ErgoBoxes.from_boxes_json([]);
  const block_headers = generate_block_headers();
  const pre_header = ergo_wasm.PreHeader.from_block_header(block_headers.get(0));
  const ctx = new ergo_wasm.ErgoStateContext(pre_header, block_headers);
  const sks_alice = new ergo_wasm.SecretKeys();
  sks_alice.add(alice_secret);
  const wallet_alice = ergo_wasm.Wallet.from_secrets(sks_alice);
  const sks_bob = new ergo_wasm.SecretKeys();
  sks_bob.add(bob_secret);
  const wallet_bob = ergo_wasm.Wallet.from_secrets(sks_bob);
  const bob_hints = wallet_bob.generate_commitments(ctx, tx, unspent_boxes, tx_data_inputs).all_hints_for_input(0);
  const bob_known = bob_hints.get(0);
  const bob_own = bob_hints.get(1);
  let hints_bag = ergo_wasm.HintsBag.empty();
  hints_bag.add_commitment(bob_known);
  const alice_tx_hints_bag = ergo_wasm.TransactionHintsBag.empty()
  alice_tx_hints_bag.add_hints_for_input(0, hints_bag);
  const partial_signed = wallet_alice.sign_transaction_multi(ctx, tx, unspent_boxes, tx_data_inputs, alice_tx_hints_bag);
  const real_propositions = new ergo_wasm.Propositions;
  const simulated_proposition = new ergo_wasm.Propositions;
  real_propositions.add_proposition_from_byte(alice_pk_bytes);
  const bob_hints_bag = ergo_wasm.extract_hints(partial_signed, ctx, unspent_boxes, tx_data_inputs, real_propositions, simulated_proposition).all_hints_for_input(0);
  bob_hints_bag.add_commitment(bob_own);
  const bob_tx_hints_bag = ergo_wasm.TransactionHintsBag.empty();
  bob_tx_hints_bag.add_hints_for_input(0, bob_hints_bag);
  const signed_tx = wallet_bob.sign_transaction_multi(ctx, tx, unspent_boxes, tx_data_inputs, bob_tx_hints_bag);
  assert(signed_tx != null);

});
