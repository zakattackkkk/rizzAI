import dotenv from "dotenv";
// import { createRuntime } from "../test_resources/createRuntime.ts";
import { searchCashTags } from "../../src/actions/cashtags.ts";
import exp from "constants";
// import { Memory, State } from "../core/types.ts";

dotenv.config();

describe("Token Finder", () => {
    test("should find $PNUT token information", async () => {
        const { data: bestMatch } = await searchCashTags("PNUT");
        console.log(bestMatch);
        expect(bestMatch.baseToken.address).toBe(
            "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump"
        );
    }, 30000);

    test("should find $autism token information", async () => {
        const { data: bestMatch } = await searchCashTags("autism");
        console.log(bestMatch);

        expect(bestMatch.baseToken.address).toBe(
            "5pH1BxNLatQ22m77ht7rQHxbPiC6tJu5fk2AY4tSpump"
        );
    }, 30000);
});
