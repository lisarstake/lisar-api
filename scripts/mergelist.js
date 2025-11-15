// Import your data arrays here
const orchestratorYieldData = [
  {
    "name": "day-dreamer.eth",
    "yield": 67.7
  },
  {
    "name": "0x2ea19...5924e",
    "yield": 66.0
  },
  {
    "name": "pepenode.eth",
    "yield": 65.9
  },
  {
    "name": "0x13364...aceba",
    "yield": 65.9
  },
  {
    "name": "lpt.moudi.eth",
    "yield": 65.8
  },
  {
    "name": "0xea6eb...d81ae",
    "yield": 65.8
  },
  {
    "name": "0x597ad...25ef6",
    "yield": 65.8
  },
  {
    "name": "0x75fbf...08d36",
    "yield": 65.8
  },
  {
    "name": "streamplace.eth",
    "yield": 65.8
  },
  {
    "name": "everest-node.eth",
    "yield": 65.7
  },
  {
    "name": "coef120.eth",
    "yield": 65.7
  },
  {
    "name": "livepeer.bl0ckm1n3r...0x4123",
    "yield": 65.7
  },
  {
    "name": "gpeer.eth",
    "yield": 65.2
  },
  {
    "name": "embody-net.eth",
    "yield": 65.0
  },
  {
    "name": "0xf5a88...e8905",
    "yield": 63.7
  },
  {
    "name": "adex-labs.eth",
    "yield": 63.6
  },
  {
    "name": "vires-in-numeris.eth",
    "yield": 63.2
  },
  {
    "name": "lptnode.eth",
    "yield": 63.2
  },
  {
    "name": "0x98099...3ad5f",
    "yield": 63.2
  },
  {
    "name": "interptr.eth",
    "yield": 63.1
  },
  {
    "name": "tor-node.eth",
    "yield": 63.1
  },
  {
    "name": "vidwave.eth",
    "yield": 62.7
  },
  {
    "name": "guardian-node.eth",
    "yield": 62.6
  },
  {
    "name": "picaxe.eth",
    "yield": 62.5
  },
  {
    "name": "allcodenet.eth",
    "yield": 62.4
  },
  {
    "name": "lpt-gzp-node.eth",
    "yield": 61.4
  },
  {
    "name": "ltp.thomasblock.eth",
    "yield": 60.8
  },
  {
    "name": "crypto-inmotion.eth",
    "yield": 60.3
  },
  {
    "name": "0x104a",
    "yield": 59.5
  },
  {
    "name": "ruthlessmango.eth",
    "yield": 59.4
  },
  {
    "name": "ftkstaking.eth",
    "yield": 59.3
  },
  {
    "name": "transcode.eth",
    "yield": 59.2
  },
  {
    "name": "0x21d11...238ff",
    "yield": 59.1
  },
  {
    "name": "0xd18a0...6141f",
    "yield": 59.1
  },
  {
    "name": "garden-state-node.e...0x4bcc",
    "yield": 59.1
  },
  {
    "name": "0x79537...587f2",
    "yield": 59.1
  },
  {
    "name": "0xac2e5...41919",
    "yield": 59.1
  },
  {
    "name": "0x18085...6a252",
    "yield": 59.1
  },
  {
    "name": "0x9d2b4...39ea3",
    "yield": 59.1
  },
  {
    "name": "livepeer.dcgco.eth",
    "yield": 59.1
  },
  {
    "name": "stronk-tech.eth",
    "yield": 59.1
  },
  {
    "name": "0xd4c46...a65f6",
    "yield": 58.5
  },
  {
    "name": "0x19a94...f63a0",
    "yield": 57.2
  },
  {
    "name": "authority-null.eth",
    "yield": 56.8
  },
  {
    "name": "neuralstream.eth",
    "yield": 56.7
  },
  {
    "name": "flowtech.eth",
    "yield": 56.4
  },
  {
    "name": "0xbd67",
    "yield": 56.3
  },
  {
    "name": "0xbb4c",
    "yield": 56.1
  },
  {
    "name": "0x9d56",
    "yield": 56.1
  },
  {
    "name": "ultimaratio.eth",
    "yield": 56.1
  },
  {
    "name": "tinyhoshi.eth",
    "yield": 56.0
  },
  {
    "name": "utopia-transcoder.e...0x74a7",
    "yield": 56.0
  },
  {
    "name": "0xbac77...b4fe0",
    "yield": 55.9
  },
  {
    "name": "eventhorizon-node.e...0x72a7",
    "yield": 55.9
  },
  {
    "name": "orcastrator.eth",
    "yield": 55.8
  },
  {
    "name": "0xd003",
    "yield": 54.2
  },
  {
    "name": "lpt.stakecn.eth",
    "yield": 53.2
  },
  {
    "name": "lpt.coaction.eth",
    "yield": 53.2
  },
  {
    "name": "bit-bender.eth",
    "yield": 53.2
  },
  {
    "name": "0x942f0...a9b4b",
    "yield": 52.6
  },
  {
    "name": "0xe9e28...ecf59",
    "yield": 52.0
  },
  {
    "name": "agent-spe.eth",
    "yield": 51.9
  },
  {
    "name": "speedybird.eth",
    "yield": 51.3
  },
  {
    "name": "treetuna.eth",
    "yield": 51.1
  },
  {
    "name": "transcoder.eth",
    "yield": 50.1
  },
  {
    "name": "ad-astra-video.eth",
    "yield": 50.0
  },
  {
    "name": "kilout.eth",
    "yield": 49.8
  },
  {
    "name": "organic-node.eth",
    "yield": 49.7
  },
  {
    "name": "0xf5661...371a9",
    "yield": 49.4
  },
  {
    "name": "daynode.eth",
    "yield": 49.4
  },
  {
    "name": "0xa6a9e...54a0e",
    "yield": 49.3
  },
  {
    "name": "0x02b6a...cc529",
    "yield": 49.3
  },
  {
    "name": "allornothing.eth",
    "yield": 49.3
  },
  {
    "name": "0xe3a57...084ca",
    "yield": 49.3
  },
  {
    "name": "sundara.eth",
    "yield": 49.3
  },
  {
    "name": "nightnode.eth",
    "yield": 49.3
  },
  {
    "name": "pragu.eth",
    "yield": 49.3
  },
  {
    "name": "pon-node.eth",
    "yield": 47.9
  },
  {
    "name": "0xbdcbe...dc841",
    "yield": 46.0
  },
  {
    "name": "video-miner.eth",
    "yield": 46.0
  },
  {
    "name": "pool.titan-node.eth",
    "yield": 46.0
  },
  {
    "name": "open-pool.eth",
    "yield": 46.0
  },
  {
    "name": "chasemedia.eth",
    "yield": 46.0
  },
  {
    "name": "joinhive.eth",
    "yield": 45.5
  },
  {
    "name": "joincluster.eth",
    "yield": 43.9
  },
  {
    "name": "dexpeer.eth",
    "yield": 39.8
  },
  {
    "name": "0x5ea1b...478ca",
    "yield": 33.3
  },
  {
    "name": "nycphilanthropy.eth",
    "yield": 32.9
  },
  {
    "name": "livepeer.grant-node...0x4f47",
    "yield": 32.8
  },
  {
    "name": "3earth.eth",
    "yield": 0.0
  },
  {
    "name": "0x08f76...82461",
    "yield": 0.0
  },
  {
    "name": "giga-kubica.eth",
    "yield": 0.0
  },
  {
    "name": "navigare-necesse-es...0x0d50",
    "yield": 0.0
  },
  {
    "name": "0x6e07b...a64b4",
    "yield": 0.0
  },
  {
    "name": "0x6c06d...68121",
    "yield": 0.0
  },
  {
    "name": "0xd21ee...9ad2e",
    "yield": 0.0
  },
  {
    "name": "0x43793...9b6c9",
    "yield": 0.0
  },
  {
    "name": "0x2cc8a...81328",
    "yield": 0.0
  },
  {
    "name": "0x22ae2...9a38a",
    "yield": 0.0
  },
  {
    "name": "solarfarm.papa-bear...0x1074",
    "yield": 0.0
  }
]

const orchestratorDetailsData = [
    {
        "id": "0x08f76e106a2dd4f6385efc8ea6c69a2816082461",
        "idShort": "0x08f7…2461",
        "name": null
    },
    {
        "id": "0x525419ff5707190389bfb5c87c375d710f5fcb0e",
        "idShort": "0x5254…cb0e",
        "name": "vires-in-numeris.eth",
        "description": "A highly reliable Livepeer Orchestrator &amp; Transcoder with a flawless track record since March 2019.<br /> Currently the top earner in transcoding fees - while having one of the lowest fee and reward cuts.<br /><br /> Part of the Livepeer community since June 2018. Reach out to me on Livepeer Discord: @vires-in-numeris (#5324, will never DM you first)<br /> Automatic notifications about reward calls, winning tickets, fee/reward cut changes and more on the telegram channel: <a href=\"https://t.me/transcoder\">https://t.me/transcoder</a> <br /> Regular updates and more info: <a href=\"https://forum.livepeer.org/t/transcoder-campaign-0x525-with-telegram-bot\">Livepeer Forum</a>",
        "url": "https://vires-in-numeris.org",
        "twitter": "0xVires",
        "github": "0xVires",
        "avatar": "/api/ens-data/image/vires-in-numeris.eth"
    },
    {
        "id": "0x5be44e23041e93cdf9bcd5a0968524e104e38ae1",
        "idShort": "0x5be4…8ae1",
        "name": "agent-spe.eth",
        "description": "The Agent SPE is dedicated to integrating Livepeer into leading AI frameworks. Together, we can establish Livepeer as the foundation for the next generation of AI-powered video processing.",
        "url": "https://AgentSPE.ai",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/agent-spe.eth"
    },
    {
        "id": "0xcf5654abfaefc001a84aeb18fe4c13bfd0f8a77b",
        "idShort": "0xcf56…a77b",
        "name": "lpt-gzp-node.eth",
        "description": "Based in Slovenia, my Livepeer orchestrator/transcoder service provides reliable video transcoding powered by NVIDIA RTX 4090, now joined by the new RTX 5090 for even greater performance. My primary focus is on Daydream, a real-time creative AI experience that transforms live video from a single text prompt. Connect on Livepeer Discord: @gasper5466.",
        "url": null,
        "twitter": null,
        "github": "gasperzupancic",
        "avatar": "/api/ens-data/image/lpt-gzp-node.eth"
    },
    {
        "id": "0xbac7744ada4ab1957cbaafef698b3c068beb4fe0",
        "idShort": "0xbac7…4fe0",
        "name": null
    },
    {
        "id": "0x2e3a21ae7cdeb48f57fcad1ce16b258d5502ac05",
        "idShort": "0x2e3a…ac05",
        "name": "ultimaratio.eth",
        "description": "Ultima Ratio is a high-performance and reliable node operating since March 2021",
        "url": "https://forum.livepeer.org/t/transcoder-campaign-ultima-ratio/1387/27",
        "twitter": "Wisermerill",
        "github": "FranckUltima",
        "avatar": "/api/ens-data/image/ultimaratio.eth"
    },
    {
        "id": "0x3b28a7d785356dc67c7970666747e042305bfb79",
        "idShort": "0x3b28…fb79",
        "name": "ad-astra-video.eth",
        "description": "Ad Astra Video providing transcoding on Livepeer network since March 2021.",
        "url": "ad-astra.video",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/ad-astra-video.eth"
    },
    {
        "id": "0x4416a274f86e1db860b513548b672154d43b81b2",
        "idShort": "0x4416…81b2",
        "name": "livepeer.dcgco.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": null
    },
    {
        "id": "0x6cb1ce2516fb7d211038420a8cf9a843c7bd3b08",
        "idShort": "0x6cb1…3b08",
        "name": "everest-node.eth",
        "description": "Your gateway to the Livepeer network! We stake, transcode, and ensure fair rewards for all delegators and server operators. Join our community and help shape the future of decentralized video. Stake with us today!",
        "url": "https://everest-node.livepeerservice.world",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/everest-node.eth"
    },
    {
        "id": "0x4a43b1d7e6227c8b0512e413f406555647ff7bdb",
        "idShort": "0x4a43…7bdb",
        "name": "ftkstaking.eth",
        "description": "<p>FTK Staking orchestrator has transcoders located in the US, Europe, and Asia. We utilize geo-location routing to ensure that streams always reach the transcoder closest to the broadcaster to achieve minimum latency and maximum reliability. As a result, FTK consistently ranks in the top orchestrators by performance network-wide.</p><br />\n<a href=\"https://livepeer.ftkuhnsman.com/\">FTK Staking Website</a><br />\n<a href=\"https://discord.gg/NCxntuq2sn\">FTK Staking Discord</a>",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/ftkstaking.eth"
    },
    {
        "id": "0x733da28b0145ff561868e408d2ac8565ebe73aab",
        "idShort": "0x733d…3aab",
        "name": "neuralstream.eth",
        "description": "🚀 NeuralStream.eth is a next-generation Livepeer Orchestrator, leveraging cutting-edge Blackwell GPU technology for ultra-efficient, high-performance video transcoding. Our node is optimized for AI-driven streaming, ensuring low-latency, high-quality video processing while maintaining energy efficiency.<br />\n<br />\n🔹 Powered by NVIDIA Blackwell for unparalleled GPU acceleration<br />\n🔹 Optimized for AI and Web3 streaming<br />\n🔹 Reliable &amp; scalable infrastructure for seamless transcoding<br />\n🔹 Built for stakers &amp; decentralization – Join us in shaping the future of decentralized video!<br />\n<br />\n💡 Stake with NeuralStream.eth and earn rewards while supporting the evolution of Web3 streaming!",
        "url": null,
        "twitter": "neuralstreameth",
        "github": null,
        "avatar": "/api/ens-data/image/neuralstream.eth"
    },
    {
        "id": "0x847791cbf03be716a7fe9dc8c9affe17bd49ae5e",
        "idShort": "0x8477…ae5e",
        "name": "stronk-tech.eth",
        "description": "<h2>Stronk Tech: <i>the</i> Orchestrator with a mission to make the Livepeer network more robust<hr /></h2>🔧 In need of open source contributions?<br />🌍 Looking for a global high performing orchestrator?<br />📈 On the hunt for low commission rates?<br />🚀 Stronk Tech comes to the rescue!<br /><br />Visit <a href=\"https://www.stronk.tech/\">our website</a> for more info on our operations and projects<br /><hr />",
        "url": "https://hub.stronk.tech",
        "twitter": null,
        "github": "stronk-dev",
        "avatar": "/api/ens-data/image/stronk-tech.eth"
    },
    {
        "id": "0x10b21af759129f32c6064adfb85d3ea2a8c0209c",
        "idShort": "0x10b2…209c",
        "name": "ruthlessmango.eth",
        "description": "High performing global video transcoding and AI inference compute node. We call all rewards and split fees in half with our delegators. Thank you for your support.",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/ruthlessmango.eth"
    },
    {
        "id": "0xf5bc0a9f43bb69ce8b44a6aee3bd93048507d93e",
        "idShort": "0xf5bc…d93e",
        "name": null
    },
    {
        "id": "0x5d98f8d269c94b746a5c3c2946634dcfc75e5e60",
        "idShort": "0x5d98…5e60",
        "name": "day-dreamer.eth",
        "description": "0% LPT reward cut, 100% daydreams. <br />\n14× RTX 5090 + RTX 6000 Pro crunching frames while I hope ETH tips cover my ramen budget.",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/day-dreamer.eth"
    },
    {
        "id": "0x9d5611bf0dadddb4441a709141d9229d7f6b3e47",
        "idShort": "0x9d56…3e47",
        "name": "crypto.ca",
        "description": "Decentralize all the things.  <br />\n(previously known as DefiCrypto.dev)",
        "url": "https://crypto.ca",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/crypto.ca"
    },
    {
        "id": "0x9c65e00546a2ad566ff26e7cd68507303381aefd",
        "idShort": "0x9c65…aefd",
        "name": null
    },
    {
        "id": "0xbc144f1a34f5b858900413d35bfb7cb6b3b0d65b",
        "idShort": "0xbc14…d65b",
        "name": "pepenode.eth",
        "description": "we are just pepe doing pepe things, looking for other pepe to stake livepepe tokens for absolutely gigontic maximum pepe yields. pepe in it for the tek but pepe needs to eat too",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/pepenode.eth"
    },
    {
        "id": "0x207967b2e92b2954dbee629d5cb2d5f59aa10c70",
        "idShort": "0x2079…0c70",
        "name": null
    },
    {
        "id": "0xbd677e96a755207d348578727aa57a512c2022bd",
        "idShort": "0xbd67…22bd",
        "name": "pixelfield.xyz",
        "description": "We are a team of Livepeer enthusiasts, fans and investors who believe that Livepeer project will be playing a major role in Web 3 adoption. With that in mind and a wish to be a part of it we are here ready to take challenges and ride this rollercoaster all together as one. So if you feel as passionate about it as we do, tag along and become a part of it as a delegator. <br />\nPixelfield has expanded to LAX !",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/pixelfield.xyz"
    },
    {
        "id": "0xd603d6bf88aa061fcab8fa552026694a7fd005ce",
        "idShort": "0xd603…05ce",
        "name": "kilout.eth",
        "description": "Reliable Orchestrator and Transcoder since 2021.<br />\nHaving one of the lowest fee and reward cuts.",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/kilout.eth"
    },
    {
        "id": "0xf37eb18ec7886751c2f6c89ff9bb7e33bd9806d5",
        "idShort": "0xf37e…06d5",
        "name": null
    },
    {
        "id": "0x0d8155e5f6c998d3f4fc4c250ffaf99f67597eda",
        "idShort": "0x0d81…7eda",
        "name": null
    },
    {
        "id": "0xdc28f2842810d1a013ad51de174d02eaba192dc7",
        "idShort": "0xdc28…2dc7",
        "name": "pon-node.eth",
        "description": "<h1>Pon-node</h1><br /><p>We are global, high performance orchestrator.<br />Node locations: NYC, LAX, LON, SIN, SOA, LTU.<br /><a href=\"https://grafana.pon-eth.com/d/oTzZM99nk/pon\">orchestrator dashboard</a><br />Get in touch on <a href=\"https://www.discordapp.com/users/904483056096772157\">Discord</a><br />Pon-node <a href=\"https://www.pon-node.xyz\">Website</a></p>",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/pon-node.eth"
    },
    {
        "id": "0x186a59938baf5ca4023cd6f87cc00684bcffdf65",
        "idShort": "0x186a…df65",
        "name": "guardian-node.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/guardian-node.eth"
    },
    {
        "id": "0x6c6cf8276cce6821cb5d26447d35f082a3c3c66b",
        "idShort": "0x6c6c…c66b",
        "name": null
    },
    {
        "id": "0x9d61ae5875e89036fbf6059f3116d01a22ace3c8",
        "idShort": "0x9d61…e3c8",
        "name": "authority-null.eth",
        "description": "<strong>Defying authority means defining decentralized infrastructure</strong>🚀<br /><p>Our mission is to actively contribute to censorship-resistant, creative empowering platforms and Livepeer is no exception.<br /></p><p>Contact us directly at Authority_Null@anlivepeer.com</p><p>Monitor our Orchestrator in real-time: <a href=\"https://anlivepeer.com/monitor/\">Node Monitoring</a><br />Frequent updates: <a href=\"https://forum.livepeer.org/t/transcoder-campaign-authority-null/1554\">Livepeer Forums</a><br />Join the community: <a href=\"https://discord.gg/BetNkRzK\">Livepeer Discord</a><br />Watch a video we created for Livepeer: <a href=\"https://youtu.be/rcBt4k_aRHs\">Watch Me</a></p>",
        "url": "https://anlivepeer.com",
        "twitter": null,
        "github": "AuthorityNull",
        "avatar": "/api/ens-data/image/authority-null.eth"
    },
    {
        "id": "0x10e0a91e652b05e9c7449ff457cf2e96c3037fb7",
        "idShort": "0x10e0…7fb7",
        "name": "interptr.eth",
        "description": "With three main nodes ( orchestrators ) located in North America and Europe, Interptr has been reliably transcoding since March 2021 and is consistently ranked among the top 10 livepeer orchestrators by trailing 90 day earnings, performance, and performance/latency globally. <br /><br />  At 25%/4%, our fee/reward cut structure is one of the most generous among top Orchestrators ( 75% of ETH earned, and 96% of LPT goes TO OUR DELEGATORS )!<br /><br />  Reach out to me in the Livepeer Discord: my username is interptr ( originally _ptr#9924, Ask to add me as a friend - note: I will never DM you first )",
        "url": "http://interptr.net/about/",
        "twitter": "interptr_netwrk",
        "github": null,
        "avatar": "/api/ens-data/image/interptr.eth"
    },
    {
        "id": "0x9d2b4e5c4b1fd81d06b883b0aca661b771c39ea3",
        "idShort": "0x9d2b…9ea3",
        "name": null
    },
    {
        "id": "0x16beb8782c2607fd90ca93f3119cf12c00255c6e",
        "idShort": "0x16be…5c6e",
        "name": null
    },
    {
        "id": "0x180859c337d14edf588c685f3f7ab4472ab6a252",
        "idShort": "0x1808…a252",
        "name": null
    },
    {
        "id": "0x2cc8aec211fdc372c0f7e4d1add1675733381328",
        "idShort": "0x2cc8…1328",
        "name": null
    },
    {
        "id": "0xac2e50c8f7ac0f82923a7df9d9903f6ec4741919",
        "idShort": "0xac2e…1919",
        "name": null
    },
    {
        "id": "0x1f5fa305abcc49e014d1dbfc4ed68befad403688",
        "idShort": "0x1f5f…3688",
        "name": null
    },
    {
        "id": "0x6dfd5cee0ed2ec24fdc814ad857902de01c065d6",
        "idShort": "0x6dfd…65d6",
        "name": null
    },
    {
        "id": "0x59266d85d94666d037c1e32daa8fac9e95cdafef",
        "idShort": "0x5926…afef",
        "name": null
    },
    {
        "id": "0x141e6d4953b933746c770272126db2bd691a9683",
        "idShort": "0x141e…9683",
        "name": "lpt.moudi.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": null
    },
    {
        "id": "0xa8aad06cd07185514a7c394649c80434af47b379",
        "idShort": "0xa8aa…b379",
        "name": "joinhive.eth",
        "description": "Powering the compute sharing economy with every home's GPU",
        "url": "https://joinhive.ai",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/joinhive.eth"
    },
    {
        "id": "0x6cbc6967a941cca12c1316e4d567c6892c3f0ed6",
        "idShort": "0x6cbc…0ed6",
        "name": null
    },
    {
        "id": "0x3104f33f422c8dbe494782e1886ad655793ad002",
        "idShort": "0x3104…d002",
        "name": null
    },
    {
        "id": "0xdef1c70578b2b5e8589a42e26980687fc5153079",
        "idShort": "0xdef1…3079",
        "name": "speedybird.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/speedybird.eth"
    },
    {
        "id": "0x13148ce7c089c69b91e460f6706c2c473fa6817d",
        "idShort": "0x1314…817d",
        "name": null
    },
    {
        "id": "0xe2236f2ad99e1dd04013665f70b7639739217a2b",
        "idShort": "0xe223…7a2b",
        "name": null
    },
    {
        "id": "0x7ee44f61987e624a721bda20a6ed2f20aa6823bd",
        "idShort": "0x7ee4…23bd",
        "name": null
    },
    {
        "id": "0x21d1130dc36958db75fbb0e5a9e3e5f5680238ff",
        "idShort": "0x21d1…38ff",
        "name": null
    },
    {
        "id": "0xf909ac60c647a14db3663da5ecf5f8ecbe324395",
        "idShort": "0xf909…4395",
        "name": "adex-labs.eth",
        "description": "High performance orchestrator with global coverage and one of the lowest cuts (truly). Building trust since March 2022.<br />\n<br />\nCuts adjustments will always have a 30 day notice on transcoder campaign page.",
        "url": "https://forum.livepeer.org/t/transcoder-campaign-adex-labs-eth/1872",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/adex-labs.eth"
    },
    {
        "id": "0xd00354656922168815fcd1e51cbddb9e359e3c7f",
        "idShort": "0xd003…3c7f",
        "name": "xodeapp.xyz",
        "description": "Enterprise-grade Livepeer Video Transcoder &amp; AI Inference - Built to Scale.",
        "url": "https://xodeapp.xyz",
        "twitter": "xodeapp",
        "github": "mikezupper",
        "avatar": "/api/ens-data/image/xodeapp.xyz"
    },
    {
        "id": "0xd5452fd11eaa41fae8a7c6ba2378f5f1fbcc8a79",
        "idShort": "0xd545…8a79",
        "name": null
    },
    {
        "id": "0x5263e0ce3a97b634d8828ce4337ad0f70b30b077",
        "idShort": "0x5263…b077",
        "name": "open-pool.eth",
        "description": "Open Pool is open-source software and a public transcoding + real-time AI inference pool designed to strengthen the Livepeer Network. By enabling the compute network to expand beyond the constraint of the 100-Orchestrator limit and seamlessly onboard private or public GPU supply, Open Pool provides the scalability, transparency, and tools the network needs to grow. <br />\n<br />\nStake with Open Pool to support decentralization, resilience, and the long-term health of the ecosystem.",
        "url": "https://www.open-pool.com",
        "twitter": null,
        "github": "Livepeer-Open-Pool",
        "avatar": "/api/ens-data/image/open-pool.eth"
    },
    {
        "id": "0xbb4c38fae6eef586f521e369117354e43ac7dd5b",
        "idShort": "0xbb4c…dd5b",
        "name": "nodz.io",
        "description": "Nodz is a highly reliable Livepeer Orchestrator/Transcoder.",
        "url": "https://nodz.io",
        "twitter": "Nodz_io",
        "github": "Nodz-io",
        "avatar": "/api/ens-data/image/nodz.io"
    },
    {
        "id": "0x75fbf65a3dfe93545c9768f163e59a02daf08d36",
        "idShort": "0x75fb…8d36",
        "name": null
    },
    {
        "id": "0xd93e0a15511935889aec76f79d54dff0e27af82e",
        "idShort": "0xd93e…f82e",
        "name": "giga-kubica.eth",
        "description": "Disclaimer:<br />\nGiga-Kubica accepts no responsibility for tire degradation, high latency, or spontaneous moon launches. 🫡",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/giga-kubica.eth"
    },
    {
        "id": "0x861eeea86b634dd952243b59f83e9e303ef6a708",
        "idShort": "0x861e…a708",
        "name": null
    },
    {
        "id": "0x2ea19c3ba9d17dd14c1d10ec818d011d2a05924e",
        "idShort": "0x2ea1…924e",
        "name": null
    },
    {
        "id": "0x6e07be22f953f716ac2e17bae1a4de3baa3a64b4",
        "idShort": "0x6e07…64b4",
        "name": null
    },
    {
        "id": "0x13364c017b282fb033107b3c0ccbf762332aceba",
        "idShort": "0x1336…ceba",
        "name": null
    },
    {
        "id": "0x51d191950353bdf1d6361e9264a49bf93f6abd4a",
        "idShort": "0x51d1…bd4a",
        "name": "streamplace.eth",
        "description": "🚀 Running my own Livepeer orchestrator to power decentralized video.  <br />\n🎥 Not a founder just a psycho fan of Stream.Place—doing work for all its nodes for free!  <br />\n🌍 Solving video for everybody, forever. Starting with live video on the AT Protocol.  <br />\n🔗 stream.place  <br />\n🛠️ Follow @iame.li for daily dev streams!  <br />\n      I am not Eli, He is.",
        "url": "https://stream.place/",
        "twitter": null,
        "github": "streamplace",
        "avatar": "/api/ens-data/image/streamplace.eth"
    },
    {
        "id": "0x0d509d8b46b072f8fc330942b2e3cc0ac34d6d8d",
        "idShort": "0x0d50…6d8d",
        "name": "navigare-necesse-est.eth",
        "description": "🚀 Experience the Future of Video Streaming with us 🚀<br />\n<br />\nReady for a journey into decentralized video streaming? We invite you to join us.<br />\n<br />\n🌟 High-Tech Reliability: Our cutting-edge infrastructure guarantees top-notch performance in transcoding and content delivery. Trust us with your video streams.<br />\n<br />\n💰 Competitive Fees: We offer an attractive fee structure, ensuring you maximize your investment's rewards.<br />\n<br />\n💎 Boosted Yields: Delegate to us and explore higher yields. We engage in the innovative Tenderize.me liquid staking program for added liquidity.<br />\n<br />\nJoin the decentralized video streaming revolution today! Delegate to our Livepeer Orchestrator and shape the future. 🌐📺🚀<br />\nhttps://t.me/+TPik8FCi1mllZWE0",
        "url": "https://livepeer.my.canva.site/",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/navigare-necesse-est.eth"
    },
    {
        "id": "0xdb22609515433e664e28067c81704d8266098986",
        "idShort": "0xdb22…8986",
        "name": "transcoder.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/transcoder.eth"
    },
    {
        "id": "0xcfc6a394a8fac4aef51df0b35692c749bb28e856",
        "idShort": "0xcfc6…e856",
        "name": null
    },
    {
        "id": "0xfcfed578958d42cd1c2ea09db09bfc1a668e0efd",
        "idShort": "0xfcfe…0efd",
        "name": null
    },
    {
        "id": "0xdac817294c0c87ca4fa1895ef4b972eade99f2fd",
        "idShort": "0xdac8…f2fd",
        "name": "pragu.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": null
    },
    {
        "id": "0xbeb81a62e9a8463c22a3f999846f3e3fb2e2002a",
        "idShort": "0xbeb8…002a",
        "name": null
    },
    {
        "id": "0x3bbe84023c11c4874f493d70b370d26390e3c580",
        "idShort": "0x3bbe…c580",
        "name": "dexpeer.eth",
        "description": "Multi-Region Orchestrator for staking, transcoding and rewards distribution",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/dexpeer.eth"
    },
    {
        "id": "0x104a7ca059a35fd4def5ecb16600b2caa1fe1361",
        "idShort": "0x104a…1361",
        "name": "eliteencoder.net",
        "description": "Livepeer Node Operator since October 2021. Active SPE Contributor. I'm passionate about building decentralized public infrastructure.<br />\n<br />\nTranscode Network (four locations)<br />\n- EU: 2x ADA 4000<br />\n- US: 1x ADA 4000 + 1x 1080<br />\n<br />\nAI Network (two locations)<br />\n- US Live Video: 4x 4090<br />\n- US Batch: 1x 3090",
        "url": "https://eliteencoder.net",
        "twitter": "EliteEncoder",
        "github": "eliteprox",
        "avatar": "/api/ens-data/image/eliteencoder.net"
    },
    {
        "id": "0xb313a1370c07733c9fe7aa6c319c5985005a5fd4",
        "idShort": "0xb313…5fd4",
        "name": "mistozy.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/mistozy.eth"
    },
    {
        "id": "0xfe7d06bcae17e80bf84c520c6aea875eedc8e67c",
        "idShort": "0xfe7d…e67c",
        "name": null
    },
    {
        "id": "0xbe8770603daf200b1fa136ad354ba854928e602b",
        "idShort": "0xbe87…602b",
        "name": "pool.titan-node.eth",
        "description": "Titan Node is a Public Pool<br /> -----------------------------------------------------------------------<br /> Bitcoin Foundation Member since 2014. Secure. Global. Proven reliability and returns. Low latency. 24/7 uptime. Built like a Titan.<br /> -----------------------------------------------------------------------<br /> Videos:<br /> 1. <a href=\"https://youtu.be/6nZrZHz12-g\">How to Stake Livepeer</a> <br /> 2. <a href=\"https://youtu.be/PH1kpXowXBY\">Ultimate Livepeer Staking Guide | How To Earn Massive Returns</a> <br /> 3. <a href=\"https://youtu.be/VTZp9xBrMsM\">How To Join Our Video Mining Pool</a> <br /> -----------------------------------------------------------------------<br /> Creator of the <a href=\"https://livepeer.academy\">Livepeer Academy</a>. <br /> Everything you’ve ever wanted to know about the Livepeer ecosystem.<br /> -----------------------------------------------------------------------",
        "url": "https://Titan-Node.com",
        "twitter": "Titan_Node",
        "github": "Titan-Node",
        "avatar": "/api/ens-data/image/pool.titan-node.eth"
    },
    {
        "id": "0x875bc4617dd691c16914e4414360ad428bd069ab",
        "idShort": "0x875b…69ab",
        "name": null
    },
    {
        "id": "0x5bdeedca9c6346b0ce6b17ffa8227a4dace37039",
        "idShort": "0x5bde…7039",
        "name": "transcode.eth",
        "description": "<b>Transcode.eth</b> (aka <b>transcode.ninja</b>) excels with ninja agility—offering swift, precise transcoding via a 4 Gbps connection near Frankfurt and London. 🥷 We prioritize high performance and reliability, powered by green energy, for an eco-friendly approach. 🌿 As an active open-source contributor, we're committed to enhancing the Livepeer ecosystem.",
        "url": "https://transcode.ninja",
        "twitter": "transcodeninja",
        "github": "transcodeninja",
        "avatar": "/api/ens-data/image/transcode.eth"
    },
    {
        "id": "0x35bb3282e4162561f534828a8747f5610ded38dc",
        "idShort": "0x35bb…38dc",
        "name": null
    },
    {
        "id": "0x0abe02f6ef1fa8c29f9b3f9f170c6f3681fd3031",
        "idShort": "0x0abe…3031",
        "name": "flowtech.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/flowtech.eth"
    },
    {
        "id": "0x68e3b80b8cc37cf14c5f7d0bfc7fdab8e898182c",
        "idShort": "0x68e3…182c",
        "name": null
    },
    {
        "id": "0xd21ee13175e0cf56876e76b0fa4003cd19e9ad2e",
        "idShort": "0xd21e…ad2e",
        "name": null
    },
    {
        "id": "0xcf627ce2b0070374a9b9e0b8259e68491ec01dd4",
        "idShort": "0xcf62…1dd4",
        "name": null
    },
    {
        "id": "0xd900fe8fb011967c81f07afe69c07c8c7dcb8af1",
        "idShort": "0xd900…8af1",
        "name": null
    },
    {
        "id": "0x0fc80afb7876f579f1fb1c4d1c37cf1339038658",
        "idShort": "0x0fc8…8658",
        "name": "coef120.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/coef120.eth"
    },
    {
        "id": "0x22ae24c2d1f489906266609d14c4c0387909a38a",
        "idShort": "0x22ae…a38a",
        "name": null
    },
    {
        "id": "0x6c06d3246fbb77c4ad75480e03d2a0a8eaf68121",
        "idShort": "0x6c06…8121",
        "name": null
    },
    {
        "id": "0xb46618598853361e4d96ce69ec6807f3b56dd2d0",
        "idShort": "0xb466…d2d0",
        "name": "lpt.stakecn.eth",
        "description": "中国大陆pos节点玩家，微博昵称:不好描述 <br />\n推特:@stakecn<br />\nindexer of the graph,orchestrators of livepeer<br />\n$ETH $ATOM $LPT $GRT",
        "url": null,
        "twitter": "stakecn",
        "github": "stakecn",
        "avatar": null
    },
    {
        "id": "0xa03113bab8d4ebe5695591f60011741233e8b82f",
        "idShort": "0xa031…b82f",
        "name": "embody-net.eth",
        "description": "The Embody Network node is dedicated to provide incentives for the growth and success of the Embody Network.",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/embody-net.eth"
    },
    {
        "id": "0x72a798ed05f3b445fba4bafdf643028fb5ed03cc",
        "idShort": "0x72a7…03cc",
        "name": "eventhorizon-node.eth",
        "description": "Worldwide Livepeer Orchestrator with low reward cut. The future of live transcoding is here.",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/eventhorizon-node.eth"
    },
    {
        "id": "0x74a7839094b7f723b2c1c915e88928f49dfdc21f",
        "idShort": "0x74a7…c21f",
        "name": "utopia-transcoder.eth",
        "description": "Trancoder based in London managed by a team of expert in network dev. High reliability. Low reward cut. Feel free to stake with us for high ROI.",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/utopia-transcoder.eth"
    },
    {
        "id": "0x4bd850175a4e43afee34ae7b7dcd079a572dd69b",
        "idShort": "0x4bd8…d69b",
        "name": "tinyhoshi.eth",
        "description": "High performing global, reliable and efficient orchestrator with one of the lowest guaranteed reward cuts and one of the best fees cut of the network. We are here for a very long time !",
        "url": "https://forum.livepeer.org/t/transcoder-campaign-tiny-hoshi/1812",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/tinyhoshi.eth"
    },
    {
        "id": "0xf566161923750b162f0cbef901861bb134c371a9",
        "idShort": "0xf566…71a9",
        "name": null
    },
    {
        "id": "0x41239fb65360981316fcb4a8548320d305f9496d",
        "idShort": "0x4123…496d",
        "name": "livepeer.bl0ckm1n3r.eth",
        "description": "Livepeer Orchestrator located in Switzerland. If you are interested in supporting our orchestrator, please contact us and we can define the reward and fee cuts together.",
        "url": "https://www.bl0ckm1n3r.io/",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/livepeer.bl0ckm1n3r.eth"
    },
    {
        "id": "0xb1c579757622d8ca7bd42542cb0325de1c8e1f8d",
        "idShort": "0xb1c5…1f8d",
        "name": "video-miner.eth",
        "description": "Power to the Pool! A transcoding pool built by a team of high performing global node operators",
        "url": "https://video-miner.com",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/video-miner.eth"
    },
    {
        "id": "0x980998e39d29dc5a92e7403fc9cd47e68b63ad5f",
        "idShort": "0x9809…ad5f",
        "name": null
    },
    {
        "id": "0x5d11abd838073df76e32c495f97fd3239eabb9fb",
        "idShort": "0x5d11…b9fb",
        "name": "chasemedia.eth",
        "description": "At Chase Media we run a North American based, high performance node. We offer competitive returns on your staked LPT. <br /> Supporting the evolution of blockchain technologies through educational content and video, inspired by video mining itself. Thank you for joining and being part of the evolution of blockchain technologies. ",
        "url": "https://chasemedia.io",
        "twitter": "Chase1Media",
        "github": null,
        "avatar": "/api/ens-data/image/chasemedia.eth"
    },
    {
        "id": "0x5caaab7626edc7123cf8484edbc66a875dd32cc9",
        "idShort": "0x5caa…2cc9",
        "name": "sundara.eth",
        "description": "🌎 Planetwide decentralized video rendering since 2021. Come <a href=\"mailto:tomy@sundara.tv?subject=LP explorer enquiry\">join the revolution</a> with us! 🚀<br /> AS2490 AS40029 AS133296 AS24560 AS19624<br /> <br /> <a href=\"https://stats.uptimerobot.com/0oEyktk43X\">Infrastructure uptime</a><br /> <a href=\"https://graf.sundara.tv:3000/public-dashboards/e03d46109188474f8858de3f6d3974eb\">Live performance dashboard</a><br /> <a href=\"https://discordapp.com/users/356215709073801218\">Discord @Sundara.eth</a><br /> <a href=\"https://forum.livepeer.org/t/transcoder-campaign-sundara/1503/8\">Forum updates</a><br /> 🇺🇸 🇨🇦 🇧🇷 🇨🇿 🇬🇧 🇩🇪 🇸🇬 🇮🇳",
        "url": "https://www.sundara.tv",
        "twitter": "Sundara_eth",
        "github": "Strykar",
        "avatar": "/api/ens-data/image/sundara.eth"
    },
    {
        "id": "0xd7775cf383481512c62e030e42e51ab7ec2adaee",
        "idShort": "0xd777…daee",
        "name": "orcastrator.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/orcastrator.eth"
    },
    {
        "id": "0x597ad7f7a1c9f8d0121a9e949cca7530f2b25ef6",
        "idShort": "0x597a…5ef6",
        "name": null
    },
    {
        "id": "0x1817efbeb9e934541ebcc12b6d37b49e45fbbf8f",
        "idShort": "0x1817…bf8f",
        "name": "gpeer.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": null
    },
    {
        "id": "0x79537bb5ed3633eb17120d8558eec439724587f2",
        "idShort": "0x7953…87f2",
        "name": null
    },
    {
        "id": "0x66970f8b4a5376ed7961e8633a83809e49ad809d",
        "idShort": "0x6697…809d",
        "name": "bit-bender.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/bit-bender.eth"
    },
    {
        "id": "0x22a48674a6fdf9335d89b6dbc05c38e2dc181475",
        "idShort": "0x22a4…1475",
        "name": "vidwave.eth",
        "description": "<br />\n<br />\n  VidWave - Livepeer Orchestrator<br />\n<br />\n<br />\n  <p>VidWave is a prominent orchestrator within the Livepeer network, boasting a robust presence with two strategically positioned nodes. With one node stationed in the UK and in the US, VidWave exemplifies reliability and global accessibility in facilitating seamless video transcoding operations. Leveraging this distributed infrastructure, VidWave stands as a cornerstone in ensuring efficient and high-quality video processing across diverse geographical regions.</p><br />\n<br />\n",
        "url": "https://www.vidwave.xyz/",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/vidwave.eth"
    },
    {
        "id": "0x6a15b9d078c2bf4814066a69392aa224fecae1c4",
        "idShort": "0x6a15…e1c4",
        "name": "daynode.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/daynode.eth"
    },
    {
        "id": "0x0bed8295866b81b80f9aff874455b82a887e185a",
        "idShort": "0x0bed…185a",
        "name": "crypto-inmotion.eth",
        "description": "Project management, mechanical industrial engineering and site construction services in the data infrastructure space",
        "url": "https://promarkdesign.net",
        "twitter": "manninmotion1",
        "github": null,
        "avatar": "/api/ens-data/image/crypto-inmotion.eth"
    },
    {
        "id": "0x5ea1b47194b98044fca8a187237d9704c91478ca",
        "idShort": "0x5ea1…78ca",
        "name": null
    },
    {
        "id": "0x47a907a0bd1627d71cd14430a721d1550d6d6f58",
        "idShort": "0x47a9…6f58",
        "name": "nightnode.eth",
        "description": "",
        "url": "https://www.nightnode.net",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/nightnode.eth"
    },
    {
        "id": "0xea6eb2033de0fbece9445fae407c596f3ffd81ae",
        "idShort": "0xea6e…81ae",
        "name": null
    },
    {
        "id": "0x11b04d9a305abe978aeaddc67d9d09aaa4996090",
        "idShort": "0x11b0…6090",
        "name": "lptnode.eth",
        "description": "My node is based in the EU zone and has been operating reliably since April '21<br /><br />Taking a lead from <a href=\"https://explorer.livepeer.org/accounts/0xb5164d6b780786338c52f4787abba0e4a371af4d/campaign\"> NYC PHILANTHROPY</a> , I am donating a portion of the income (10% of Orchestrator rewards and ETH fees) to a local charity here in the Channel Islands, <a> Holidays for Heroes </a><br /><br />Donations will be made quarterly, starting on 1st July 2021, and receipts can be made available on request",
        "url": "https://forum.livepeer.org/t/transcoder-campaign-lptnode-je/1368",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/lptnode.eth"
    },
    {
        "id": "0xd18a02647d99dc9f79afbe0f58f8353178e6141f",
        "idShort": "0xd18a…141f",
        "name": null
    },
    {
        "id": "0x4a1c83b689816e40b695e2f2ce8fc21229076e74",
        "idShort": "0x4a1c…6e74",
        "name": "lpt.coaction.eth",
        "description": "Coaction is dedicated to improving the competitiveness, user experience, &amp; decentralization of validator sets across the crypto ecosystem by building a secondary staking incentive layer.",
        "url": "https://coaction.network",
        "twitter": "CoactionNetwork",
        "github": null,
        "avatar": "/api/ens-data/image/lpt.coaction.eth"
    },
    {
        "id": "0xb5164d6b780786338c52f4787abba0e4a371af4d",
        "idShort": "0xb516…af4d",
        "name": "nycphilanthropy.eth",
        "description": "The first and only Livepeer Orchestrator to donate for social good in the areas of the arts. The Orchestrator has pledged at least 30% of this node's total ETH Fee earnings to be directed towards philanthropic efforts. Node run with a RTX 4090, right here in NYC.",
        "url": "https://nycphilanthropy.com",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/nycphilanthropy.eth"
    },
    {
        "id": "0x9c5874aa481b9c652d5420d65ce8becaad9ff3a7",
        "idShort": "0x9c58…f3a7",
        "name": "allcodenet.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": null
    },
    {
        "id": "0x58887c5fe7d021ec63b72ac4021980027e6fafe1",
        "idShort": "0x5888…afe1",
        "name": "picaxe.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": null
    },
    {
        "id": "0x43942a3b2883ba56c67750de398d4f1d1b3a3fdb",
        "idShort": "0x4394…3fdb",
        "name": "joincluster.eth",
        "description": "Discover the power of seamless video transcoding with Cluster. Transform videos into multiple formats, resolutions and bitrates with ease, delivering high-quality viewing experiences for all devices. We are builders first, join Cluster if you want to actively participate in growing the decentralized video ecosystem.",
        "url": "joincluster.com",
        "twitter": "https://twitter.com/joincluster",
        "github": null,
        "avatar": null
    },
    {
        "id": "0x4f4758f7167b18e1f5b3c1a7575e3eb584894dbc",
        "idShort": "0x4f47…4dbc",
        "name": "livepeer.grant-node.xyz",
        "description": "A Public Video Transcoding Pool operated by the Video Miner team.",
        "url": "https://grant-node.xyz",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/livepeer.grant-node.xyz"
    },
    {
        "id": "0xe9e284277648fcdb09b8efc1832c73c09b5ecf59",
        "idShort": "0xe9e2…cf59",
        "name": null
    },
    {
        "id": "0x942f0c28fb85ea0b50bfb76a3ecfa99861fa9b4b",
        "idShort": "0x942f…9b4b",
        "name": null
    },
    {
        "id": "0x02b6aac33a397aaadee5227c70c69bb97f2cc529",
        "idShort": "0x02b6…c529",
        "name": null
    },
    {
        "id": "0xe3a5793d7c1d2a04a903fa1695b3e3555d6084ca",
        "idShort": "0xe3a5…84ca",
        "name": null
    },
    {
        "id": "0xa20416801ac2eacf2372e825b4a90ef52490c2bb",
        "idShort": "0xa204…c2bb",
        "name": "allornothing.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": null
    },
    {
        "id": "0x4bcc9256418b29c482596443fa5c99ae114b3351",
        "idShort": "0x4bcc…3351",
        "name": "garden-state-node.eth",
        "description": "New Jersey's Premier Livepeer Orchestrator",
        "url": "https://www.gardenstatenode.com",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/garden-state-node.eth"
    },
    {
        "id": "0x19a946d42be53c134e929a6936aecbdd9adf63a0",
        "idShort": "0x19a9…63a0",
        "name": null
    },
    {
        "id": "0xb8c66a19c2d4ccfe79e002d9e3a02dff73de4aba",
        "idShort": "0xb8c6…4aba",
        "name": "organic-node.eth",
        "description": "Organic-Node - Multi region high performing and reliable orchestrator. Node locations: VA, LAX, LON, BTN",
        "url": "https://www.discordapp.com/users/435303559974617089",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/organic-node.eth"
    },
    {
        "id": "0x16d335f6265ae2dcf6022863e9d9346ab8a73841",
        "idShort": "0x16d3…3841",
        "name": "tor-node.eth",
        "description": "High performing and reliability is what this node strives for with high speed internet and high quality GPUs across the globe. <br />\n<br />\nConnect with us on discord: https://discord.com/channels/@me/408125407334891531",
        "url": "https://hemann244.wixsite.com/tor-node",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/tor-node.eth"
    },
    {
        "id": "0xa6a9eb29e786b5233bd99c0ba28be882fe954a0e",
        "idShort": "0xa6a9…4a0e",
        "name": null
    },
    {
        "id": "0xbdcbe92befbf36d63ec547bba5842997d77dc841",
        "idShort": "0xbdcb…c841",
        "name": null
    },
    {
        "id": "0x22b1bcc0c0db224bfc56c9b95a2db407548666ee",
        "idShort": "0x22b1…66ee",
        "name": "ltp.thomasblock.eth",
        "description": "ThomasBlock's reliable Livepeer Orchestrator. Low reward cut. 50% of ETH transcoding fees are distributed. Started in June 2023, but i am here for the long game.",
        "url": "https://www.thomasblock.io/",
        "twitter": "ThomasBlockB",
        "github": null,
        "avatar": "/api/ens-data/image/ltp.thomasblock.eth"
    },
    {
        "id": "0xd4c467d8c13752ab7bb9711bc77de2a9f52a65f6",
        "idShort": "0xd4c4…65f6",
        "name": null
    },
    {
        "id": "0xf5a88945ce64b5648b895e05eb1edf693dde8905",
        "idShort": "0xf5a8…8905",
        "name": null
    },
    {
        "id": "0x13c4299cc484c9ee85c7315c18860d6c377c03bf",
        "idShort": "0x13c4…03bf",
        "name": "livepeer🚀🌑.eth",
        "description": "",
        "url": "https://nframe.nl",
        "twitter": null,
        "github": "https://github.com/stronk-dev",
        "avatar": null
    },
    {
        "id": "0xcfe1ed2d133fbb488929edc15eee5812f5dc8877",
        "idShort": "0xcfe1…8877",
        "name": null
    },
    {
        "id": "0xb2fbdcad8c166c8ea1a7624f48800da0249326a5",
        "idShort": "0xb2fb…26a5",
        "name": null
    },
    {
        "id": "0x5fed4e606b613f55b72cfb33f3c06a87abce8c4d",
        "idShort": "0x5fed…8c4d",
        "name": null
    },
    {
        "id": "0xb8f7a24efcc859209d6a6086521cf338b875bca1",
        "idShort": "0xb8f7…bca1",
        "name": null
    },
    {
        "id": "0x55bfbc0832477249ad82de35bcf66e015e38971d",
        "idShort": "0x55bf…971d",
        "name": null
    },
    {
        "id": "0x0aaed74e0d03d522ff40d7c9b24343f3d0e0c730",
        "idShort": "0x0aae…c730",
        "name": null
    },
    {
        "id": "0xc3bbddb238b3ecead684902299fe5bf23e2519d0",
        "idShort": "0xc3bb…19d0",
        "name": null
    },
    {
        "id": "0x4892d9f86d4426fdf87d3b6eec599bb39e1277e0",
        "idShort": "0x4892…77e0",
        "name": null
    },
    {
        "id": "0x41b037e421b80aafcfd3d2a2390341e6bdfed3d6",
        "idShort": "0x41b0…d3d6",
        "name": null
    },
    {
        "id": "0x054ccd68a2ac152fcfb93a15b6f75eea53dcd9e0",
        "idShort": "0x054c…d9e0",
        "name": null
    },
    {
        "id": "0xfc1c09b6847dc0a07a2fb1025fde79872d0c19ef",
        "idShort": "0xfc1c…19ef",
        "name": "not-the-fed.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": null
    },
    {
        "id": "0xdc3584e6ae02a7d04fd75ace83a67c637bd23341",
        "idShort": "0xdc35…3341",
        "name": "photonintrique.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": null
    },
    {
        "id": "0xa76af35706b5cf0b498e69ce17dd5d11f9985954",
        "idShort": "0xa76a…5954",
        "name": null
    },
    {
        "id": "0xc3a942f5702b3b42addd14861f0868272681be26",
        "idShort": "0xc3a9…be26",
        "name": null
    },
    {
        "id": "0x5e0cb245f25ac45b342d9643b5795f6362cddcd6",
        "idShort": "0x5e0c…dcd6",
        "name": null
    },
    {
        "id": "0xdefa166112a725314bec52ebb693959c4cb851f4",
        "idShort": "0xdefa…51f4",
        "name": null
    },
    {
        "id": "0x9b78215ac6b272f4df1f89e6b1e9b0363d5d19ac",
        "idShort": "0x9b78…19ac",
        "name": null
    },
    {
        "id": "0x0ea21ce04a7446ea71e64ee7eff2c91edd51ed71",
        "idShort": "0x0ea2…ed71",
        "name": null
    },
    {
        "id": "0x70ded5d07299d56a7656b286b4c11bafe839c7de",
        "idShort": "0x70de…c7de",
        "name": null
    },
    {
        "id": "0x526df14b48c37f03d0a59e091940e75418991c44",
        "idShort": "0x526d…1c44",
        "name": null
    },
    {
        "id": "0x09cadd175db27c3f785165a9ae56935dba39676b",
        "idShort": "0x09ca…676b",
        "name": null
    },
    {
        "id": "0xf53a446a8d95da6738e1d6be459cfb5b895a69bc",
        "idShort": "0xf53a…69bc",
        "name": null
    },
    {
        "id": "0xf9cca0b41063b611dd210250ec9754007e87de6f",
        "idShort": "0xf9cc…de6f",
        "name": null
    },
    {
        "id": "0xebb3438c1978e1aa8ff59e89a6e4c3b30b6e765b",
        "idShort": "0xebb3…765b",
        "name": null
    },
    {
        "id": "0xcf599b29a50d0b111455818c914f274c1bcc90ba",
        "idShort": "0xcf59…90ba",
        "name": null
    },
    {
        "id": "0x882bac0da055d1826ee637c410c8d4c99be8b485",
        "idShort": "0x882b…b485",
        "name": "gwiz-ai.eth",
        "description": "Livepeer AI Processing &amp; Transcoding at Lighting Speeds using State of the art technology, Delegate with Gwiz to earn MAX rewards while keeping the cost low for the end user.",
        "url": "https://gwiz-ai.com",
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/gwiz-ai.eth"
    },
    {
        "id": "0x47cd6b7e7308fb062586e5185b4f3ee7e224eefe",
        "idShort": "0x47cd…eefe",
        "name": null
    },
    {
        "id": "0x4ff13f251b008c4035017a27da70790bfefc896b",
        "idShort": "0x4ff1…896b",
        "name": null
    },
    {
        "id": "0x22b544d19ffe43c6083327271d9f39020da30c65",
        "idShort": "0x22b5…0c65",
        "name": null
    },
    {
        "id": "0xc5519fd1129d6d22744e0ac491401fff45d26528",
        "idShort": "0xc551…6528",
        "name": null
    },
    {
        "id": "0x39da02e5cec00784f0908d3d2627ab98e0b566c7",
        "idShort": "0x39da…66c7",
        "name": null
    },
    {
        "id": "0xa3bd517dcbdc063c4c24f0d9837bbc5ce869d092",
        "idShort": "0xa3bd…d092",
        "name": null
    },
    {
        "id": "0x5c26ddae83a37c2d182f2ad5d673570f8977e3ba",
        "idShort": "0x5c26…e3ba",
        "name": null
    },
    {
        "id": "0xf8b343b34b646b5258d2000f5996261a8f807bc3",
        "idShort": "0xf8b3…7bc3",
        "name": null
    },
    {
        "id": "0xf4ce635a19ac1edc195bf98e5ae74cd8bbc7f8f5",
        "idShort": "0xf4ce…f8f5",
        "name": null
    },
    {
        "id": "0xb9830ad5276867b37146971ad84324498367d75c",
        "idShort": "0xb983…d75c",
        "name": null
    },
    {
        "id": "0x1ae1220658bf9cd4d02cfd17409c09fb9e8fd9f5",
        "idShort": "0x1ae1…d9f5",
        "name": "ianhopper.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": null
    },
    {
        "id": "0x1c3e29e3608e37755da937f02f1229bfc2f92947",
        "idShort": "0x1c3e…2947",
        "name": null
    },
    {
        "id": "0x5509be53b2dd0cd6fb8473b0eda94e0a3059b73a",
        "idShort": "0x5509…b73a",
        "name": null
    },
    {
        "id": "0x1d863e2acb9a5b34c1ae9e5f0ab9c40baf3470ca",
        "idShort": "0x1d86…70ca",
        "name": null
    },
    {
        "id": "0x5de6c2141aaf86948085ca50bb908d7310a4ee08",
        "idShort": "0x5de6…ee08",
        "name": null
    },
    {
        "id": "0xd84781e1a9b74d71ea76cda8bb9f30893bfd00d1",
        "idShort": "0xd847…00d1",
        "name": null
    },
    {
        "id": "0x0ff3acb772e2fc3004127c5d945f596f8fff6b4a",
        "idShort": "0x0ff3…6b4a",
        "name": null
    },
    {
        "id": "0x14c0c200ec08e52d57d604758b48174f1efdb091",
        "idShort": "0x14c0…b091",
        "name": null
    },
    {
        "id": "0x001f1e677bea9ac50f733955601905401f03b35a",
        "idShort": "0x001f…b35a",
        "name": null
    },
    {
        "id": "0x20b5ba0c3221700a83b4d74d32240e496c3ecac7",
        "idShort": "0x20b5…cac7",
        "name": null
    },
    {
        "id": "0x4daab5ddceece444a659a56690f3241178c3289e",
        "idShort": "0x4daa…289e",
        "name": null
    },
    {
        "id": "0x3e4032b8eafcb501d2a9fb59a54b01debf31c2df",
        "idShort": "0x3e40…c2df",
        "name": null
    },
    {
        "id": "0xf98454bf239a1c35162a0c4e0a8a531353f05f6f",
        "idShort": "0xf984…5f6f",
        "name": null
    },
    {
        "id": "0xeb6dde1a9e305fe8b1556056bbdf14d25d3a878b",
        "idShort": "0xeb6d…878b",
        "name": "3earth.eth",
        "description": "3earth is a multi-node orchestrator providing transcoding and AI compute with 16Gb/s of fiber connectivity around the globe. <br />High performing orchestrator with a perfect 100% reward call history. <br />If you have any questions about staking or our operations contact us at 3earth@proton.me",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/3earth.eth"
    },
    {
        "id": "0x85c9f75ca19cea3e15f32514639011d98f6655ec",
        "idShort": "0x85c9…55ec",
        "name": null
    },
    {
        "id": "0x6814d8cbf86394df57e1c4ff7167db9cd85a6cd5",
        "idShort": "0x6814…6cd5",
        "name": null
    },
    {
        "id": "0x9ff4df83320a93e2c417212004857a5ff8688c38",
        "idShort": "0x9ff4…8c38",
        "name": null
    },
    {
        "id": "0x8bce57b7b84218397ffb6cefae99f4792ee8161d",
        "idShort": "0x8bce…161d",
        "name": null
    },
    {
        "id": "0xa617f96fb909090df1058dbbd82c941e243436b7",
        "idShort": "0xa617…36b7",
        "name": null
    },
    {
        "id": "0x85f1a2b4847696cb730796628036e68b9aa14eb6",
        "idShort": "0x85f1…4eb6",
        "name": null
    },
    {
        "id": "0x9b4e28020b94b28f9f09ede87f588e89c283cffd",
        "idShort": "0x9b4e…cffd",
        "name": null
    },
    {
        "id": "0x79c1e2ef8af38fc65c587d1b7cc5fcf4ce800314",
        "idShort": "0x79c1…0314",
        "name": null
    },
    {
        "id": "0x42e5f7a4c4cdf9abb45dedff8b54751781d3c11d",
        "idShort": "0x42e5…c11d",
        "name": null
    },
    {
        "id": "0x9e48d670d2bd7300796caa6c05e3d2cc41b8cb9c",
        "idShort": "0x9e48…cb9c",
        "name": "treetuna.eth",
        "description": "Livepeer Orchestrator",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": "/api/ens-data/image/treetuna.eth"
    },
    {
        "id": "0x6ce5f4c45f079292b2d9d4b53f79969f6b89995f",
        "idShort": "0x6ce5…995f",
        "name": "uakaritech.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": null
    },
    {
        "id": "0xe687f42f75f98157badd0443553ddf806c32477a",
        "idShort": "0xe687…477a",
        "name": "classicchrome.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": null
    },
    {
        "id": "0x423e897749c3b6f9e6e80ef8e60718ce670672d2",
        "idShort": "0x423e…72d2",
        "name": "016018.eth",
        "description": "",
        "url": null,
        "twitter": null,
        "github": null,
        "avatar": null
    },
    {
        "id": "0x000dd19b120a57c2ca3340be9d6d071ecd5a9633",
        "idShort": "0x000d…9633",
        "name": "worksucks.eth",
        "description": "I update bank software for the 2000 switch",
        "url": "https://petergibbonspennies.com/",
        "twitter": "PeterGibbonsPGP",
        "github": null,
        "avatar": "/api/ens-data/image/worksucks.eth"
    },
    {
        "id": "0x0fb64df1afcc97d7a25057a86e1b2be0db4e3bb4",
        "idShort": "0x0fb6…3bb4",
        "name": null
    },
    {
        "id": "0xc47ffc704eadc55a98d795d2bc890b0e0bf0e1a6",
        "idShort": "0xc47f…e1a6",
        "name": null
    },
    {
        "id": "0xa0058b3a974ee3be6aaa8badac1947fe72bb1db9",
        "idShort": "0xa005…1db9",
        "name": null
    },
    {
        "id": "0x2451c9eeb24f2782c162238b53a40e102e1956a7",
        "idShort": "0x2451…56a7",
        "name": null
    },
    {
        "id": "0x2435f2b018cf1589090da3d8cde337dd7627f8c1",
        "idShort": "0x2435…f8c1",
        "name": null
    },
    {
        "id": "0x75b53e7dac1ddb757bfbcd5dea6dd4a3b9408c5e",
        "idShort": "0x75b5…8c5e",
        "name": null
    },
    {
        "id": "0x801d783eba081394fe5d5b835a793f41fb203343",
        "idShort": "0x801d…3343",
        "name": null
    },
    {
        "id": "0x58996955cf065939eeae8c9478a89b194adfcc16",
        "idShort": "0x5899…cc16",
        "name": null
    },
    {
        "id": "0xa5925d42fe6b651b01fd23fcb06cf4af9dd0e5a5",
        "idShort": "0xa592…e5a5",
        "name": null
    },
    {
        "id": "0x84edef77bcb20dbf0a373673b550c3eff10dbb5d",
        "idShort": "0x84ed…bb5d",
        "name": null
    },
    {
        "id": "0x44d37300d1848fb795a94014a152f9e4ee4c6cf7",
        "idShort": "0x44d3…6cf7",
        "name": null
    },
    {
        "id": "0xe5c4dcdc9eeec2fb9a1e0860de3aa1c4fa4c1eeb",
        "idShort": "0xe5c4…1eeb",
        "name": null
    }
]
function normalizeIdentifier(str) {
  if (!str) return null;
  
  // Remove ellipsis and normalize
  const normalized = str.toLowerCase().trim();
  
  // If it's an address format (starts with 0x), extract the start and end
  if (normalized.startsWith('0x')) {
    // Extract first 6 and last 5 characters for short form matching
    if (normalized.includes('...')) {
      return normalized.replace('...', '');
    }
    // For full addresses, create a comparable format
    if (normalized.length > 10) {
      return `${normalized.slice(0, 6)}${normalized.slice(-5)}`;
    }
  }
  
  return normalized;
}

function findMatch(yieldName, detailsArray) {
  const normalizedYieldName = normalizeIdentifier(yieldName);
  
  for (const detail of detailsArray) {
    // Try matching with name field
    if (detail.name) {
      const normalizedDetailName = normalizeIdentifier(detail.name);
      if (normalizedDetailName === normalizedYieldName) {
        return detail;
      }
    }
    
    // Try matching with idShort field
    if (detail.idShort) {
      const normalizedIdShort = normalizeIdentifier(detail.idShort);
      if (normalizedIdShort === normalizedYieldName) {
        return detail;
      }
    }
    
    // Try matching with full id field (for short names in yield data)
    if (detail.id && normalizedYieldName) {
      const normalizedId = normalizeIdentifier(detail.id);
      if (normalizedId === normalizedYieldName) {
        return detail;
      }
    }
  }
  
  return null;
}

function mergeOrchestratorData(yieldData, detailsData) {
  return yieldData.map(yieldItem => {
    const match = findMatch(yieldItem.name, detailsData);
    
    return {
      name: yieldItem.name,
      yield: yieldItem.yield,
      id: match?.id || null,
      description: match?.description || null
    };
  });
}

// Execute the merge
const mergedData = mergeOrchestratorData(orchestratorYieldData, orchestratorDetailsData);

// Output the result
console.log(JSON.stringify(mergedData, null, 2));

// Export for use
export default mergedData;