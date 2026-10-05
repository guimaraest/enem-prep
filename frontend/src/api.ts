import * as constants from "./constants";

class Api {
    baseURL: string;

    constructor() {
        this.baseURL = constants.BASEURL;
    }

    getQuestions(index?: number) {
        if (index !== undefined) {
            return this.getQuestionByIndex(index);
        }

        return this.getAllQuestions();
    }

    private getQuestionByIndex(index: number) {
        // GET /questions/{index}
    }

    private getAllQuestions() {
        // GET /questions

    }
}