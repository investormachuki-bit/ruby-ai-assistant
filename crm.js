async function loadDashboard() {

    // LOAD STATS

    const { data: statsData } = await supabaseClient
        .from("leads")
        .select("status");

    let newLeads = 0;
    let contacted = 0;
    let trialBooked = 0;
    let registered = 0;

    statsData.forEach(lead => {

        if (lead.status === "New") newLeads++;
        if (lead.status === "Contacted") contacted++;
        if (lead.status === "Trial Booked") trialBooked++;
        if (lead.status === "Registered") registered++;

    });

    document.getElementById("stats").innerHTML = `
        <h3>📊 Dashboard</h3>

        New Leads: ${newLeads}<br>
        Contacted: ${contacted}<br>
        Trial Booked: ${trialBooked}<br>
        Registered: ${registered}
    `;

    // LOAD LEADS

    const { data: leads } = await supabaseClient
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

    const table = document.getElementById("leadsTable");

    table.innerHTML = "";

    leads.forEach(lead => {

        table.innerHTML += `
        <tr>
            <td>${lead.name || ""}</td>
            <td>${lead.phone || ""}</td>
            <td>${lead.interest || ""}</td>
            <td>${lead.status || ""}</td>

            <td>

                <button type="button" onclick="markContacted('${lead.id}')">
    Contacted
</button>

                <button type="button" onclick="markRegistered('${lead.id}')">
    Registered
</button>

            </td>

        </tr>
        `;

    });

}

async function markContacted(id) {

    await supabaseClient
        .from("leads")
        .update({
            status: "Contacted"
        })
        .eq("id", id);

    loadDashboard();
}

async function markRegistered(id) {

    await supabaseClient
        .from("leads")
        .update({
            status: "Registered"
        })
        .eq("id", id);

    loadDashboard();
}

loadDashboard();
