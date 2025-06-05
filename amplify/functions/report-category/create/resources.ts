import { defineFunction } from "@aws-amplify/backend";

export const createReportCategoryFnc = defineFunction({
    name: "createReportCategoryFnc",
        timeoutSeconds: 30,
})