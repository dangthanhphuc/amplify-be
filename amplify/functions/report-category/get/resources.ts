import { defineFunction } from "@aws-amplify/backend";

export const getReportCategoryFnc = defineFunction({
    name: "getReportCategoryFnc",
        timeoutSeconds: 30,
})