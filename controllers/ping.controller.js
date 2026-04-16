exports.getPing = (req, res) => {
    res.json({
        ok: true,
        message: "pong",
        time: Date.now()
    });
};

exports.postPing = (req, res) => {
    console.log("📩 Backend received test:");
    console.log(req.body);

    res.json({
        received: true,
        stage: req.body?.stage || "unknown",
        time: Date.now()
    });
};