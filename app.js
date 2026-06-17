alert("APP JS LOADED");

async function sendMessage() {

    try {

        const { data, error } = await supabaseClient
            .from("knowledge_base")
            .select("content");

        if (error) {
            alert(error.message);
            return;
        }

        let knowledge = "";

        data.forEach(item => {
            knowledge += item.content + "\n";
        });

        const prompt = `
You are Sauti Tamu Music School AI Assistant.

Business Information:
${knowledge}

Question:
How long is the training?
`;

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
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            }
        );

        alert("GEMINI RESPONDED");

        const result = await response.json();

        alert(JSON.stringify(result));

    } catch (err) {

        alert("ERROR: " + err.message);

    }

}
