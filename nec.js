#!/usr/bin/env node
const { program } = require("commander");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const extract = require("extract-zip");
const chalk = require('chalk');

const unpackRelease = async () => {
    try {
        fs.emptyDirSync("./extract");
        await extract(path.resolve("./release.zip"), { dir: path.resolve("./extract") });
        console.log("Extraction complete");
        moveEachFileAndFolder();
    } catch (err) {
        console.log(err);
    }
};

const moveEachFileAndFolder = () => {
    var rootFolder = fs.readdirSync("./extract").shift();
    var files = fs.readdirSync("./extract/" + rootFolder);
    for (var i in files) {
        var file = files[i];
        // console.log(path.resolve("../" + file));
        try {
            var targetPath = path.resolve("./" + file);
            fs.moveSync(path.resolve("./extract/" + rootFolder + "/" + file), targetPath);
        } catch (e) {
            console.log(e);
        }
    }
    fs.removeSync("./extract/" + rootFolder);
};

program.version("0.0.1");
program
    .command("update <password> [version]")
    .description("Updates N&CFramework to the latest version.")
    .action((password, version) => {
        axios
            .post(
                "http://swfacil.servicos.ws/framework/get",
                {
                    password,
                    version,
                },
                {
                    responseType: "stream",
                }
            )
            .then(function (response) {
                response.data.pipe(fs.createWriteStream("./release.zip"));
            });
    });
program.command("unpack").description("Unpacks lastest download of N&CFramework.").action(unpackRelease);
program
    .command("list  <password>")
    .description("Lists available versions of N&CFramework.")
    .action((password) => {
        axios
            .post("http://swfacil.servicos.ws/framework/list", {
                password,
            })
            .then(function (response) {
                console.log("Available "+chalk.yellow("versions")+"\n"+response.data.join("\n"));
                // response.data.pipe(fs.createWriteStream("./release.zip"));
            });
    });
program.parse(process.argv);
