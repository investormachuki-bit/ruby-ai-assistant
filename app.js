alert("APP JS LOADED");

async function sendMessage() {

    alert("BUTTON CLICKED");

    try {

        alert(typeof supabaseClient);

        const { data, error } = await supabaseClient
            .from("knowledge_base")
            .select("*");

        if (error) {
            alert("SUPABASE ERROR: " + error.message);
            return;
        }

        alert("ROWS FOUND: " + data.length);

    } catch (err) {

        alert("JS ERROR: " + err.message);

    }

}
