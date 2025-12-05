import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "../contexts/AuthContext"
import { useState } from "react"
import { useSearchParams } from "react-router-dom";

export function Filter({name, desc, fields}) {
  console.log(fields)
  const { addEvent } = useAuth();
  const [ formValues, setFormValues ] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
    const handleSubmit = (e) => {
      e.preventDefault();
      // console.log(formValues);
      setSearchParams(formValues);
    };

  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button variant="" style={{"height":"46px"}}>Filters</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
            <DialogDescription>
                {desc}
            </DialogDescription>
          </DialogHeader>
        {Object.entries(fields).map(([k, v]) => (
          <div className="grid gap-4">
            <div className="grid gap-3 pt-5">
              {v[0] === "string" ?
              <div className="flex-col">
                <Label htmlFor={`${k}-1`}>{v[1]}</Label>
                <Input
                  className="mt-2"
                  id={`${k}-1`}
                  name={k}
                  value={formValues[k] ?? ""}
                  onChange={(e) =>
                    setFormValues(prev => ({ ...prev, [k]: e.target.value }))
                  }
                />
                </div> :
                v[0] === "boolean" ?
                <div className="flex">
                        <Switch
                          id={`${k}-1`}
                          name={k}
                          checked={!!formValues[k]}
                          onCheckedChange={(val) =>
                            setFormValues(prev => ({ ...prev, [k]: val }))
                          }
                        />
                    <Label htmlFor={`${k}-1`} className="pl-4">{v[1]}</Label>
                </div> :
               v[0] === 'number' ? <Input
                  id={`${k}-1`}
                  name={k}
                  value={formValues[k] ?? ""}
                  onChange={(e) =>
                    setFormValues(prev => ({ ...prev, [k]: e.target.value }))
                  }

                  type="number"
                  min="0"
                  step="1"
                /> : <></>}
            </div>
          </div>
                    ))}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
            <Button type="submit">Apply</Button>
            </DialogClose>
          </DialogFooter>
      </form>
        </DialogContent>
    </Dialog>
  )
}

