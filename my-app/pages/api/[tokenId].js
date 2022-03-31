

export default function  handler(req,res){
    const tokenId = req.query.tokenId;
    const name= `crypto Dev #${tokenId}`;
    const description = "this is a nft for web3 developers";
    const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${Number(tokenId)-1}.svg`
   return res.status(200).json({
        name:tokenId,
        description:description,
        image:image
    })
}