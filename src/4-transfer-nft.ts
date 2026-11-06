// Extension 4: transfer NFT ownership to the second wallet.
import { fetchAsset, transfer } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import { explorer, recipient, sig, state, umi } from "./common";

const asset = await fetchAsset(umi, publicKey(state.nft));
const newOwner = recipient().publicKey;
console.log("owner before:", asset.owner);

const res = await transfer(umi, { asset, newOwner }).sendAndConfirm(umi);

console.log("owner after: ", (await fetchAsset(umi, asset.publicKey)).owner);
console.log("transfer tx:", explorer(sig(res.signature)));
