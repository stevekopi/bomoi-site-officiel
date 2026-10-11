import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rename, rm, readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const release=JSON.parse(await readFile(new URL("../app/pos-release.json",import.meta.url),"utf8"));
const file=new URL(`../public${release.path}`,import.meta.url);
async function valid(target){try{const hash=createHash("sha256");let bytes=0;for await(const chunk of createReadStream(target)){hash.update(chunk);bytes+=chunk.length}return bytes===release.bytes&&hash.digest("hex")===release.sha256}catch{return false}}
if(await valid(file)){console.log("APK signé présent et vérifié.");process.exit(0)}
await mkdir(path.dirname(fileURLToPath(file)),{recursive:true});
const partial=new URL(file.href+".part");
try{
 const response=await fetch(release.source);
 if(!response.ok||!response.body)throw new Error(`Téléchargement APK : HTTP ${response.status}`);
 await pipeline(Readable.fromWeb(response.body),createWriteStream(partial));
 if(!await valid(partial))throw new Error("L’APK téléchargé ne correspond pas à l’empreinte de la version publiée.");
 await rename(partial,file);console.log("APK signé téléchargé et vérifié.");
}catch(error){await rm(partial,{force:true});throw error}
