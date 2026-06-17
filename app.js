async function sendMessage() {

    const input = document.getElementById("message");

    const text = input.value;

    if(!text) return;

    const chat = document.getElementById("chat");

    chat.innerHTML += `
        <p><b>You:</b> ${text}</p>
    `;

    input.value = "";

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                contents:[
                    {
                        parts:[
                            {
                                text:text
                            }
                        ]
                    }
                ]
            })
        }
    );

    const data = await response.json();

    const answer =
        data.candidates?.[0]?.content?.parts?.[0]?.text
        || "No response";

    chat.innerHTML += `
        <p><b>AI:</b> ${answer}</p>
    `;

}
