from pathlib import Path
import json, os, re


class ExtensionHandler:
    def __init__(self, **kwargs):

        self.path: str = kwargs.get("path")

        if self.path.endswith("discode"):
            self.path = re.sub(r"[^\\]+\.discode$", "", self.path)

        self.project_name = kwargs.get("project_name", None)

        self.bot_token = kwargs.get("bot_token", None)
        self.default_command_prefix = kwargs.get("default_command_prefix", None)
        self.description = kwargs.get("description", None)

    def create_project(self):

        try:
            Path(self.path + f"/{self.project_name}/assets").mkdir(
                parents=True,
            )
            Path(self.path + f"/{self.project_name}/exts").mkdir(
                parents=True,
            )
        except FileExistsError:
            return "file_exists"

        with open(
            self.path + f"/{self.project_name}/{self.project_name}.discode", "w"
        ) as file:
            json.dump(
                {
                    "data": {
                        "project_name": self.project_name,
                        "path": self.path,
                        "bot_token": self.bot_token,
                        "default_command_prefix": self.default_command_prefix,
                        "description": self.description,
                    }
                },
                file,
                indent=4,
            )

        self.create_extension(
            "General", "This extension was generated by Discode for you!"
        )
        self.apply_starter_template("general")

        return self.path + f"/{self.project_name}.discode"

    def create_extension(
        self,
        name: str,
        description: str = "",
    ):

        with open(
            self.path + f"/{self.project_name}/exts/{name.lower()}.ext.discode", "w"
        ) as f:
            json.dump(
                {"data": {"name": name, "description": description, "node_data": {}}},
                f,
                indent=4,
            )

    def update_extension(self, name: str, node_data: dict): ...

    def get_project(
        self,
    ):
        data = {"extensions": []}

        for ext in os.listdir(self.path + "/exts/"):
            with open(self.path + "/exts/" + ext, "r") as f:

                _data = json.load(f)

                data["extensions"].append(_data["data"]["name"])

        return data

    def get_extension(self, name: str):
        for ext in os.listdir(self.path + "/exts/"):
            with open(f"{self.path}/exts/{ext.lower()}", "r") as f:
                _data = json.load(f)
                if _data["data"]["name"].lower() == name.lower():
                    return _data["data"]["node_data"]

        return None

    def apply_starter_template(self, template_name: str):

        with open(
            self.path
            + f"/{self.project_name}/exts/{template_name.lower()}.ext.discode",
            "r+",
        ) as f:
            data = json.load(f)

            data["data"]["node_data"] = {
                "nodes": [
                    {
                        "width": 501,
                        "height": 269,
                        "id": "command0",
                        "type": "command",
                        "position": {"x": 329, "y": 246},
                        "data": {
                            "label": "NOT IMPLEMENTED YET NODE",
                            "variables": [],
                            "parameters": [],
                            "command_name": "hello",
                            "description": "Says hello back 🙂",
                        },
                        "selected": False,
                        "positionAbsolute": {"x": 329, "y": 246},
                        "dragging": False,
                    },
                    {
                        "width": 364,
                        "height": 142,
                        "id": "say1",
                        "type": "say",
                        "position": {"x": 939, "y": 535},
                        "data": {
                            "label": "NOT IMPLEMENTED YET NODE",
                            "variables": [],
                            "parameters": [],
                            "text": "Hey there!",
                        },
                        "selected": False,
                        "positionAbsolute": {"x": 939, "y": 535},
                        "dragging": False,
                    },
                ],
                "edges": [
                    {
                        "source": "command0",
                        "sourceHandle": "b",
                        "target": "say1",
                        "targetHandle": None,
                        "type": "then",
                        "markerEnd": {
                            "type": "arrowclosed",
                            "width": 20,
                            "height": 20,
                            "color": "#6ADFDA",
                        },
                        "style": {
                            "strokeWidth": 2,
                            "stroke": "rgba(120, 221, 227, 0.42)",
                        },
                        "data": {"variables": ["Command Context"]},
                        "id": "reactflow__edge-command0b-say1",
                    }
                ],
                "viewport": {
                    "x": 5.513016450029568,
                    "y": -41.48698354997032,
                    "zoom": 1,
                },
            }

            f.seek(0)

            json.dump(data, f, indent=4)
