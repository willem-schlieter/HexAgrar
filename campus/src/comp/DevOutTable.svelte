<script lang="ts">

    export let keys: string[] = ["Ausgabe/Output", "Art"];
    // let rows: string[][] = [["Wert 1", "<b>Alt</b>"], ["Wert 2", "Neu"]];
    let rows: Array<string[] | string> = [];

    export function log (row: string[] | string): void {
        rows = rows.concat([row]);
        if (typeof row !== "string" && row.length !== keys.length) console.warn("Die Anzahl der Elemente in der eingegebenen Row (" + row.length + ") stimmt nicht mit der Anzahl der Schlüssel (" + keys.length + ") überein. Der Output kann nicht gelogt werden.");
    }
    export function clear (): void {
        rows = [];
    }
</script>

<div id="__">
    <table>
        <tr>
            {#each keys as k}
                <th>{@html k}</th>
            {/each}
                
        </tr>
        {#each rows as row}
            <tr>
                {#if typeof row === "string"}
                    <td colspan={keys.length}>{@html row}</td>
                {:else}
                    {#each row as e}
                        <td>{@html e}</td>
                    {/each}
                {/if}
            </tr>
        {/each}
    </table>
</div>

<style>
    #__ {
        font-family: 'Courier New', Courier, monospace;
        color: black;
        font-size: 17px;
        padding: 10px;
        border: 2px solid #ccc;
        border-radius: 5px;
        background-color: #f6ffee;
        margin-top: 20px;
    }
    table {
        border-collapse: collapse;
        width: 100%;
    }
    th, td {
        border: 1px solid #444;
        padding: 5px;
        text-align: center;
    }
</style>