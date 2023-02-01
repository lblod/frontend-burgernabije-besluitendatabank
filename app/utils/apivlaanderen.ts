export interface ApiVlaanderenMunicipality {
    
    gemeentenaam: { 
        geografischeNaam: {
            spelling: string
        }
    }
}

export async function getMunicipalitiesFromVlaanderen(toString=false) : Promise<Array<string|ApiVlaanderenMunicipality>> {
    const data = await (await fetch("https://api.basisregisters.vlaanderen.be/v2/gemeenten/")).json()
    if (!toString) {
        return data.gemeenten;
    } else {
        const municipalities = data.gemeenten.map((municipality: ApiVlaanderenMunicipality) => municipality.gemeentenaam.geografischeNaam.spelling);
        return municipalities
    }
}