interface ApiVlaanderenMunicipality {
    
    gemeentenaam: { 
        geografischeNaam: {
            spelling: string
        }
    }
}

export default async function getMunicipalitiesFromVlaanderen() : Promise<Array<string>> {
    const data = await (await fetch("https://api.basisregisters.vlaanderen.be/v2/gemeenten/")).json()
    const municipalities = data.gemeenten.map((municipality: ApiVlaanderenMunicipality) => municipality.gemeentenaam.geografischeNaam.spelling);

    return municipalities;
}