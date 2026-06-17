async function sendMessage() {

    const input = document.getElementById("message");
    const question = input.value;

    if (!question) return;

    const chat = document.getElementById("chat");

    chat.innerHTML += `<p><b>You:</b> ${question}</p>`;

    input.value = "";

    // Get business knowledge from Supabase

    const { data, error } = await supabaseClient
        .from("knowledge_base")
        .select("content");

    if (error) {

        chat.innerHTML += `
            <p><b>System:</b> Failed to load knowledge base.</p>
        `;

        return;
    }

    let knowledge = "";

    data.forEach(item => {
        knowledge += item.content + "\n";
    });

    const prompt = `
You are Sauti Tamu Music School AI Assistant.

Use ONLY the information below when answering.

BUSINESS INFORMATION:

${knowledge}

CUSTOMER QUESTION:

${question}

If the answer is not found in the business information, politely tell the user to contact the school directly.
`;

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

    const result = await response.json();

    const answer =
        result?.candidates?.[0]?.content?.parts?.[0]?.text
        || "Sorry, I could not generate a response.";

    chat.innerHTML += `
        <p><b>Sauti Tamu AI:</b> ${answer}</p>
    `;
    async function sendMessage() {

    alert("1 - Function started");

    const input = document.getElementById("message");
    const question = input.value;

    alert("2 - Got question");

    const { data, error } = await supabaseClient
        .from("knowledge_base")
        .select("content");

    alert("3 - Supabase finished");

    if(error){
        alert("SUPABASE ERROR: " + error.message);
        return;
    }

    alert("4 - Knowledge loaded");

}
}
