
import sharp from 'sharp';
import fs from 'node:fs/promises';
const dir='docs/redesign-2026-10-06/implementation/';
const source='docs/redesign-2026-10-06/mockups/';
async function pair(a,b,out,w=724) {
 const x=await sharp(a).resize({width:w}).toBuffer(), y=await sharp(b).resize({width:w}).toBuffer();
 const ax=await sharp(x).metadata(), by=await sharp(y).metadata();
 await sharp({create:{width:w*2,height:Math.max(ax.height,by.height),channels:3,background:'#ffffff'}}).composite([{input:x,left:0,top:0},{input:y,left:w,top:0}]).png().toFile(dir+out);
}
await pair(source+'optimix-desktop-hero.png',dir+'desktop-first-final.png','comparison-desktop-first-final.png',710);
await pair(source+'optimix-desktop-full.png',dir+'desktop-full-final.png','comparison-desktop-full-final.png',724);
const geom=JSON.parse(await fs.readFile(dir+'mobile-geometry-final.json','utf8'));
const full=await sharp(dir+'mobile-full-final.png').metadata();
const scale=full.width/geom.width;
const start=geom.sections.find(s=>s.id==='examples').y;
const value=geom.sections.find(s=>s.id==='value').y;
const bounds=[0,start,value,geom.pageHeight];
for(let i=0;i<3;i++) {
 await sharp(source+'optimix-mobile-full-board.png').extract({left:[8,297,593][i],top:27,width:276,height:1757}).png().toFile(dir+'mobile-source-segment-'+(i+1)+'.png');
 await sharp(dir+'mobile-full-final.png').extract({left:0,top:Math.round(bounds[i]*scale),width:full.width,height:Math.min(Math.round((bounds[i+1]-bounds[i])*scale),full.height-Math.round(bounds[i]*scale))}).png().toFile(dir+'mobile-implementation-segment-'+(i+1)+'.png');
 await pair(dir+'mobile-source-segment-'+(i+1)+'.png',dir+'mobile-implementation-segment-'+(i+1)+'.png','comparison-mobile-segment-'+(i+1)+'.png',390);
}
await sharp(dir+'mobile-source-segment-1.png').resize({width:390}).extract({left:0,top:0,width:390,height:844}).png().toFile(dir+'mobile-source-hero.png');
await pair(dir+'mobile-source-hero.png',dir+'mobile-first-final.png','comparison-mobile-first-final.png',390);
const metadata={};
for(const name of ['desktop-first-final.png','desktop-full-final.png','mobile-first-final.png','mobile-full-final.png']){const m=await sharp(dir+name).metadata();metadata[name]={width:m.width,height:m.height};}
await fs.writeFile(dir+'capture-dimensions.json',JSON.stringify(metadata,null,2));console.log(metadata);
