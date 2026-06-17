alert("APP JS LOADED");

async function sendMessage() {

    try {

        alert("SENDING TO GEMINI");

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: "Say hello"
                                }
                            ]
                        }
                    ]
                })
            }
        );

        alert("STATUS: " + response.status);

        const result = await response.json();

        alert(JSON.stringify(result));

    } catch (err) {

        alert("ERROR: " + err.message);

        console.error(err);

    }

}
