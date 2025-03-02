import arcjet, {tokenBucket, shield, detectBot} from "@arcjet/node";
import  "dotenv/config.js"

// init arcjet
//arcjet docs https://docs.arcjet.com/get-started?f=node-js-express
export const arc = arcjet({
    key:process.env.ARCJET_KEY,
    characteristics:["ip.src"],
    rules:[
        //shield protect this app from common attacks e.g. SQL injection, XSS, CSRF
        shield({mode:"LIVE"}),
        detectBot({
            mode:"LIVE",
            allow:[
                "CATEGORY:SEARCH_ENGINE"
            ]
        }),
        //rate limiting
        tokenBucket({
            mode:"LIVE",
            refillRate:50,
            interval:50,
            capacity:50
        })

    ]
})