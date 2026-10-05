import * as constants from "./constants";

class api {
    constructor() {
        this.baseURL = BASEURL;
    }

    getQuestions(index?: number) {
        if (index !== undefined) {
            return getQuestionByIndex(index);
        }

        return this.getAllQuestions();
    }

    private getQuestionByIndex() {

    }

    private getAllQuestions() {

    }
}