import { defineFunction } from "@aws-amplify/backend";

export const listReportCategoriesFnc = defineFunction({
    name: "listReportCategoriesFnc",
        timeoutSeconds: 30,
})