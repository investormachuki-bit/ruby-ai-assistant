async function sendMessage() {

    try {

        alert("1 - Function started");

        const input = document.getElementById("message");
        const question = input.value.trim();

        if (!question) {
            alert("Question is empty");
            return;
        }

        const chat = document.getElementById("chat");

        chat.innerHTML += `
            <p><b>You:</b> ${question}</p>
        `;

        input.value = "";

        alert("2 - Getting knowledge base");

        const { data, error } = await supabaseClient
            .from("knowledge_base")
            .select("content");

        alert("3 - Supabase returned");

        if (error) {
            alert("SUPABASE ERROR: " + error.message);

            chat.innerHTML += `
                <p><b>System:</b> ${error.message}</p>
            `;

            return;
        }

        let knowledge = "";

        data.forEach(item => {
            knowledge += item.content + "\n\n";
        });

        alert("4 - Knowledge loaded");

        const prompt = `
You are Sauti Tamu Music School AI Assistant.

Only answer using the information below.

BUSINESS INFORMATION:

${knowledge}

CUSTOMER QUESTION:

${question}

If the answer is not available in the business information,
politely ask the customer to contact the school.
`;

        alert("5 - Sending to Gemini");

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

        alert("6 - Gemini responded");

        const result = await response.json();

        console.log(result);

        const answer =
            result?.candidates?.[0]?.content?.parts?.[0]?.text
            || "No response received from Gemini.";

        chat.innerHTML += `
            <p><b>Sauti Tamu AI:</b> ${answer}</p>
        `;

        alert("7 - Finished");

    } catch (err) {

        alert("ERROR: " + err.message);

        document.getElementById("chat").innerHTML += `
            <p><b>Error:</b> ${err.message}</p>
        `;

        console.error(err);
    }
}
