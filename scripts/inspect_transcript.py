import json

transcript_path = r"C:\Users\acer\.gemini\antigravity-ide\brain\59bfcc5f-0c84-446a-95a8-c8925ebd0235\.system_generated\logs\transcript.jsonl"
with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        idx = data.get("step_index")
        mtype = data.get("type")
        if mtype == "USER_INPUT":
            print(f"[Step {idx}] USER: {data.get('content')[:200]}")
        elif mtype == "PLANNER_RESPONSE":
            tc = data.get("tool_calls", [])
            for c in tc:
                print(f"[Step {idx}] TOOL: {c.get('name')} | {c.get('args', {}).get('toolAction') or c.get('args', {}).get('toolSummary')}")
            content = data.get("content")
            if content:
                print(f"[Step {idx}] TEXT: {content[:300]}...")
