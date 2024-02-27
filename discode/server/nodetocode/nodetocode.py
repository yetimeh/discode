import logging


class NodeToCode:
    def __init__(self) -> None:
        self.data = {
            "commands": {},
            "events": [],
        }

        self.logger = logging.getLogger("NodeToCode")

        formatter = logging.Formatter("NodeToCode -> %(levelname)s - %(message)s")
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)

    def parse(self, data):
        """

        {
            "commands": [
                    "command_id": {
                        "name": command_name
                        "description: description

                        "actions": [
                            {
                                'id': node_id,
                                'type': action_type,
                                'data': [],

                            },
                            ...
                        ]
                    }

                ],
            "events": [],

        }
        """

        for node in data["nodes"]:
            if node["type"] == "command":  # Found a command

                self.logger.info(
                    f"Found command {node['id']} - {node['data']['command_name']}"
                )

                self.data["commands"][node["id"]] = {
                    "name": node["data"]["command_name"],
                    "description": node["data"].get("description", None),
                    "actions": self.get_actions(data, node["id"]),
                }

            elif node["type"] == "event":  # Found an event
                ...  # TODO: Implement event support

        return self.data

    def get_actions(self, data, node_id):

        tree = []

        def build_tree(
            child_action,
        ):

            tree.append(child_action)

            for edge in self.get_edges_of_action(data, child_action["id"]):
                for action in self.get_actions_with_edge(data, edge["target"]):
                    build_tree(
                        action,
                    )

        for edge in self.get_edges_of_action(data, node_id):  # First time
            for action in self.get_actions_with_edge(data, edge["target"]):
                build_tree(action)

        return tree  # TODO: Improve this code?

    def get_edges_of_action(self, data, node_id):
        _edges = []

        for edge in data["edges"]:
            if node_id in edge["source"]:
                _edges.append(edge)

        return _edges

    def get_actions_with_edge(self, data, target_id):

        actions = []

        for node in data["nodes"]:
            if node["id"] == target_id:
                actions.append(
                    {"id": node["id"], "type": node["type"], "data": node["data"]}
                )

        return actions


SAMPLE_DATA = """{
    "nodes": [
        {
            "width": 501,
            "height": 269,
            "id": "command0",
            "type": "command",
            "position": {
                "x": -320.0852556917085,
                "y": 45.595237461177675
            },
            "data": {
                "label": "NOT IMPLEMENTED YET NODE",
                "command_name": "hello",
                "description": "aaa"
            },
            "selected": false,
            "positionAbsolute": {
                "x": -320.0852556917085,
                "y": 45.595237461177675
            },
            "dragging": false
        },
        {
            "width": 364,
            "height": 142,
            "id": "say1",
            "type": "say",
            "position": {
                "x": 533.2631712536454,
                "y": -37.7691736968942
            },
            "data": {
                "label": "command1/say1"
            },
            "selected": false,
            "positionAbsolute": {
                "x": 533.2631712536454,
                "y": -37.7691736968942
            },
            "dragging": false
        },
        {
            "width": 364,
            "height": 142,
            "id": "say2",
            "type": "say",
            "position": {
                "x": 325.6100016417209,
                "y": 294.17275436888286
            },
            "data": {
                "label": "command1/say2"
            },
            "selected": false,
            "dragging": false,
            "positionAbsolute": {
                "x": 325.6100016417209,
                "y": 294.17275436888286
            }
        },
        {
            "width": 364,
            "height": 142,
            "id": "say3",
            "type": "say",
            "position": {
                "x": 931.8966282458799,
                "y": 518.4988062124218
            },
            "data": {
                "label": "command1/say2/say3"
            },
            "positionAbsolute": {
                "x": 931.8966282458799,
                "y": 518.4988062124218
            }
        },
        {
            "width": 501,
            "height": 269,
            "id": "command4",
            "type": "command",
            "position": {
                "x": -575.8801420484342,
                "y": 809.5675327351288
            },
            "data": {
                "label": "NOT IMPLEMENTED YET NODE",
                "command_name": "BITCH"
            },
            "positionAbsolute": {
                "x": -575.8801420484342,
                "y": 809.5675327351288
            }
        },
        {
            "width": 364,
            "height": 142,
            "id": "say5",
            "type": "say",
            "position": {
                "x": 222.1198579515658,
                "y": 1023.5675327351288
            },
            "data": {
                "label": "command2/say3"
            },
            "positionAbsolute": {
                "x": 222.1198579515658,
                "y": 1023.5675327351288
            }
        }
    ],
    "edges": [
        {
            "source": "command0",
            "sourceHandle": "b",
            "target": "say1",
            "targetHandle": null,
            "type": "then",
            "markerEnd": {
                "type": "arrowclosed",
                "width": 20,
                "height": 20,
                "color": "#6ADFDA"
            },
            "style": {
                "strokeWidth": 2,
                "stroke": "rgba(120, 221, 227, 0.42)"
            },
            "data": {
                "variables": [
                    "Command Context"
                ]
            },
            "id": "reactflow__edge-command0b-say1"
        },
        {
            "source": "command0",
            "sourceHandle": "b",
            "target": "say2",
            "targetHandle": null,
            "type": "then",
            "markerEnd": {
                "type": "arrowclosed",
                "width": 20,
                "height": 20,
                "color": "#6ADFDA"
            },
            "style": {
                "strokeWidth": 2,
                "stroke": "rgba(120, 221, 227, 0.42)"
            },
            "data": {
                "variables": [
                    "Command Context"
                ]
            },
            "id": "reactflow__edge-command0b-say2"
        },
        {
            "source": "say2",
            "sourceHandle": null,
            "target": "say3",
            "targetHandle": null,
            "type": "then",
            "markerEnd": {
                "type": "arrowclosed",
                "width": 20,
                "height": 20,
                "color": "#6ADFDA"
            },
            "style": {
                "strokeWidth": 2,
                "stroke": "rgba(120, 221, 227, 0.42)"
            },
            "data": {
                "variables": [
                    "TextChannel"
                ]
            },
            "id": "reactflow__edge-say2-say3"
        },
        {
            "source": "command4",
            "sourceHandle": "b",
            "target": "say5",
            "targetHandle": null,
            "type": "then",
            "markerEnd": {
                "type": "arrowclosed",
                "width": 20,
                "height": 20,
                "color": "#6ADFDA"
            },
            "style": {
                "strokeWidth": 2,
                "stroke": "rgba(120, 221, 227, 0.42)"
            },
            "data": {
                "variables": [
                    "Command Context"
                ]
            },
            "id": "reactflow__edge-command4b-say5"
        }
    ],
    "viewport": {
        "x": 616.9400710242171,
        "y": 87.21623363243566,
        "zoom": 0.5
    }
}"""

cls = NodeToCode()

import json
from pprint import pprint as p

p(cls.parse(json.loads(SAMPLE_DATA)))
