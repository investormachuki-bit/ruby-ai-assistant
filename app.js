alert("APP JS LOADED");

async function sendMessage() {

    alert("BUTTON CLICKED");

    try {

        const { data, error } = await supabaseClient
            .from("knowledge_base")
            .select("*");

        if (error) {
            alert("SUPABASE ERROR: " + error.message);
            return;
        }

        alert("ROWS FOUND: " + data.length);

        console.log(data);

    } catch (err) {

        alert("JS ERROR: " + err.message);

    }

}
