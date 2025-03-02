import {arc} from "./arcjet.js";

function isSpoofed(result) {
    return (
        // You probably don't want DRY_RUN rules resulting in a denial
        // since they are generally used for evaluation purposes but you
        // could log here.
        result.state !== "DRY_RUN" &&
        result.reason.isBot() &&
        result.reason.isSpoofed()
    );
}


export async function defence (req, res,next) {
    try{
        const decision = await arc.protect(req, { requested: 5 }); // Deduct 5 tokens from the bucket
        console.log("Arcjet decision", decision);

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                res.writeHead(429, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Ты охуел" }));
            } else if (decision.reason.isBot()) {
                res.writeHead(403, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "No bots allowed" }));
            } else {
                res.writeHead(403, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Forbidden" }));
            }
        } else if (decision.results.some(isSpoofed)) {
            // Arcjet Pro plan verifies the authenticity of common bots using IP data.
            // Verification isn't always possible, so we recommend checking the decision
            // separately.
            // https://docs.arcjet.com/bot-protection/reference#bot-verification
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Forbidden" }));
        }
        next()
    }catch(err){
        console.error("Arcjet error ", err);
        next(err)
    }
}