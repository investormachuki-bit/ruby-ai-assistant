alert("APP JS LOADED");

async function sendMessage() {

    try {

        alert("START");

        alert("CLIENT: " + typeof supabaseClient);

        const result = await supabaseClient
            .from("knowledge_base")
            .select("*");

        alert("QUERY FINISHED");

        alert(JSON.stringify(result));

    } catch (err) {

        alert("ERROR: " + err.message);

    }

}
