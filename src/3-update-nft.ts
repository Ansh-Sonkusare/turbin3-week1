// Task 3: as update authority, change the NFT's name and metadata URI.
import { fetchAsset, update } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import { explorer, REPO_RAW, sig, state, umi } from "./common";

const asset = await fetchAsset(umi, publicKey(state.nft));
console.log("before:", { name: asset.name, uri: asset.uri });

const res = await update(umi, { asset, name: "Turbin3 Builder #1 (Evolved)", uri: `${REPO_RAW}/metadata/v2.json` }).sendAndConfirm(umi);

const after = await fetchAsset(umi, asset.publicKey);
console.log("after: ", { name: after.name, uri: after.uri });
console.log("update tx:", explorer(sig(res.signature)));
